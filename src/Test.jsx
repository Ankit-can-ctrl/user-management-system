import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import Loader from "../Loader"; // Import the new Loader component

const Homepage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    address: {
      street: "",
      city: "",
    },
    company: {
      name: "",
    },
    website: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false); // New state for tracking operations
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!loading && users.length > 0) {
      localStorage.setItem("managementAppUsers", JSON.stringify(users));
    }
  }, [users, loading]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();

      const savedUsers = localStorage.getItem("managementAppUsers");
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      } else {
        setUsers(data);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const validateForm = () => {
    // ... (existing validation logic)
    const errors = {};
    if (formData.name.length < 3)
      errors.name = "Name must be at least 3 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Invalid email format";
    if (!/^\+?[\d\s-]{10,}$/.test(formData.phone))
      errors.phone = "Invalid phone number";
    if (!formData.address.street) errors.street = "Street is required";
    if (!formData.address.city) errors.city = "City is required";
    if (formData.company.name && formData.company.name.length < 3)
      errors.companyName = "Company name must be at least 3 characters";
    if (
      formData.website &&
      !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
        formData.website
      )
    )
      errors.website = "Invalid URL format";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users",
        {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            "Content-type": "application/json",
          },
        }
      );
      const newUser = await response.json();
      const newId = Math.max(...users.map((user) => user.id), 0) + 1;
      const userWithId = { ...newUser, id: newId };

      setUsers([...users, userWithId]);
      setFormData({
        name: "",
        email: "",
        phone: "",
        username: "",
        address: { street: "", city: "" },
        company: { name: "" },
        website: "",
      });
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);
    try {
      await fetch(
        `https://jsonplaceholder.typicode.com/users/${selectedUser.id}`,
        {
          method: "PUT",
          body: JSON.stringify(formData),
          headers: {
            "Content-type": "application/json",
          },
        }
      );

      const updatedUser = { ...selectedUser, ...formData };

      setUsers(
        users.map((user) => (user.id === selectedUser.id ? updatedUser : user))
      );
      setSelectedUser(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        username: "",
        address: { street: "", city: "" },
        company: { name: "" },
        website: "",
      });
      setIsModalOpen(false);
    } catch (err) {
      setError("Failed to update user. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setIsProcessing(true);
    try {
      await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, {
        method: "DELETE",
      });
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const openModal = (user = null) => {
    // ... (existing openModal logic)
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        username: user.username,
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
        },
        company: {
          name: user.company?.name || "",
        },
        website: user.website,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        username: "",
        address: { street: "", city: "" },
        company: { name: "" },
        website: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    // ... (existing handleInputChange logic)
    const { name, value } = e.target;
    if (name === "street" || name === "city") {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    } else if (name === "companyName") {
      setFormData((prev) => ({
        ...prev,
        company: {
          ...prev.company,
          name: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (name === "name" && !selectedUser) {
      setFormData((prev) => ({
        ...prev,
        username: `USER-${value.toLowerCase().replace(/\s/g, "")}`,
      }));
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      {isProcessing && <Loader />}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-600 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" /> Add User
        </button>
      </div>

      {/* Search input for filtering users */}
      <input
        type="text"
        placeholder="Search by name..."
        className="border border-gray-300 p-2 rounded-md mb-4"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* ... (rest of the component remains unchanged) */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Website
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={user.id}
                className={
                  index % 2 === 0
                    ? "bg-blue-100 hover:bg-blue-200 transition-colors"
                    : "bg-green-100 hover:bg-green-200 transition-colors"
                }
              >
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{`${
                  user.address?.street || ""
                }, ${user.address?.city || ""}`}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.company?.name || ""}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.website}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-1 hover:bg-white rounded-md transition-colors"
                      onClick={() => openModal(user)}
                    >
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </button>
                    <button
                      className="p-1 hover:bg-white rounded-md transition-colors"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedUser ? "Edit User" : "Add New User"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Name"
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm">{formErrors.name}</p>
              )}

              <input
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Email"
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm">{formErrors.email}</p>
              )}

              <input
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Phone"
                required
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
              {formErrors.phone && (
                <p className="text-red-500 text-sm">{formErrors.phone}</p>
              )}

              <input
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                placeholder="Username"
                required
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                readOnly
              />

              <input
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Street"
                required
                name="street"
                value={formData.address.street}
                onChange={handleInputChange}
              />
              {formErrors.street && (
                <p className="text-red-500 text-sm">{formErrors.street}</p>
              )}

              <input
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="City"
                required
                name="city"
                value={formData.address.city}
                onChange={handleInputChange}
              />
              {formErrors.city && (
                <p className="text-red-500 text-sm">{formErrors.city}</p>
              )}

              <input
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Company Name (Optional)"
                name="companyName"
                value={formData.company.name}
                onChange={handleInputChange}
              />
              {formErrors.companyName && (
                <p className="text-red-500 text-sm">{formErrors.companyName}</p>
              )}

              <input
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Website (Optional)"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
              />
              {formErrors.website && (
                <p className="text-red-500 text-sm">{formErrors.website}</p>
              )}

              <button
                onClick={selectedUser ? handleUpdateUser : handleCreateUser}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                {selectedUser ? "Update User" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
