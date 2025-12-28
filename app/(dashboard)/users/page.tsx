"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { fetchFromBackend } from "@/lib/api-client";
import { UsersPagination } from "./components/UsersPagination";

type UserRole = "admin" | "agent";

type User = {
  id: number;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
};

type FormState = {
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

const DEFAULT_FORM: FormState = {
  name: "",
  lastName: "",
  email: "",
  role: "agent",
  isActive: true,
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchFromBackend("/users?page=1&limit=500");
      const items = Array.isArray(data) ? data : data?.data || [];
      setUsers(items);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();
    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      );
    });
  }, [users, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const resetForm = () => setFormData(DEFAULT_FORM);
  const clearValidationErrors = () => setValidationErrors({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.role) errors.role = "Role is required";
    return errors;
  };

  const handleCreate = () => {
    resetForm();
    clearValidationErrors();
    setShowCreate(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    clearValidationErrors();
    setShowEdit(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowDelete(true);
  };

  const handleSubmitCreate = async () => {
    setValidationErrors({});
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetchFromBackend("/users", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          role: formData.role,
        }),
      });

      const resetCode = response?.reset?.resetCode;
      toast({
        title: "User created",
        description: resetCode
          ? `Reset code (dev): ${resetCode}`
          : "A reset code was sent to the user email.",
      });

      setShowCreate(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedUser) return;
    setValidationErrors({});
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await fetchFromBackend(`/users/${selectedUser.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: formData.name.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          role: formData.role,
          isActive: formData.isActive,
        }),
      });

      toast({
        title: "User updated",
        description: "User details saved successfully.",
      });
      setShowEdit(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDelete = async () => {
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      await fetchFromBackend(`/users/${selectedUser.id}`, {
        method: "DELETE",
      });
      toast({
        title: "User deleted",
        description: "User removed successfully.",
      });
      setShowDelete(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await fetchFromBackend(`/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      toast({
        title: user.isActive ? "User blocked" : "User unblocked",
        description: `${user.email} is now ${
          user.isActive ? "blocked" : "active"
        }.`,
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage system access and account status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-64"
          />
          <Button onClick={handleCreate}>New User</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading users...</div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-background/60 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <div className="col-span-3 px-4 py-3">User</div>
            <div className="col-span-3 px-4 py-3">Email</div>
            <div className="col-span-2 px-4 py-3">Role</div>
            <div className="col-span-2 px-4 py-3">Status</div>
            <div className="col-span-2 px-4 py-3 text-right">Actions</div>
          </div>
          {paginatedUsers.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              No users found.
            </div>
          ) : (
            paginatedUsers.map((user) => (
              <div key={user.id} className="grid grid-cols-12 border-t text-sm">
                <div className="col-span-3 px-4 py-3 font-medium">
                  {user.name} {user.lastName}
                </div>
                <div className="col-span-3 px-4 py-3 text-muted-foreground">
                  {user.email}
                </div>
                <div className="col-span-2 px-4 py-3">
                  <Badge variant="outline">{user.role}</Badge>
                </div>
                <div className="col-span-2 px-4 py-3">
                  <Badge variant={user.isActive ? "outline" : "destructive"}>
                    {user.isActive ? "Active" : "Blocked"}
                  </Badge>
                </div>
                <div className="col-span-2 px-4 py-3 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(user)}
                  >
                    {user.isActive ? "Block" : "Unblock"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(user)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!loading && filteredUsers.length > 0 && (
        <UsersPagination
          totalCount={filteredUsers.length}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1);
          }}
          onPageChange={setCurrentPage}
        />
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>
              A random password will be created and a reset code will be
              emailed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Input
                  placeholder="First name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
                {validationErrors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.name}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: event.target.value,
                    }))
                  }
                />
                {validationErrors.lastName && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.lastName}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
              />
              {validationErrors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>
            <div>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  {/* Si hay otros roles, se pueden agregar aquí, pero no se bloquea por rol */}
                </SelectContent>
              </Select>
              {validationErrors.role && (
                <p className="text-xs text-red-500 mt-1">
                  {validationErrors.role}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCreate} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details or block access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Input
                  placeholder="First name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Input
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={formData.isActive ? "active" : "blocked"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: value === "active",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to delete{" "}
              {selectedUser?.email}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSubmitDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
