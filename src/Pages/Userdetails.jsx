import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Loader from "../Loader";

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = () => {
      setLoading(true);
      const savedUsers = localStorage.getItem("managementAppUsers");
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const foundUser = users.find((u) => u.id === parseInt(id));
        if (foundUser) {
          setUser(foundUser);
        } else {
          setError("User not found");
        }
      } else {
        setError("No user data available");
      }
      setLoading(false);
    };

    fetchUser();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!user) return <div className="p-4">User not found</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Link to="/" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to Users List
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">{user.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {user.phone}
            </p>
            <p>
              <span className="font-medium">Username:</span> {user.username}
            </p>
            <p>
              <span className="font-medium">Website:</span> {user.website}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Address</h2>
            <p>
              <span className="font-medium">Street:</span>{" "}
              {user.address?.street}
            </p>
            <p>
              <span className="font-medium">City:</span> {user.address?.city}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Company</h2>
          <p>
            <span className="font-medium">Name:</span> {user.company?.name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
