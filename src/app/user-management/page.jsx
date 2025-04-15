'use client';
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from '@supabase/supabase-js';
import { FaChevronLeft, FaChevronRight, FaTimes, FaEdit } from "react-icons/fa";
import DraggableTable from "../customComponents/DraaggableTable";
import Alert from "../customComponents/Alert";
import { getRandomColor } from "../constants/constant";
import { getAllUsers } from "@/lib/services/adminServices";
import CustomButton from "../customComponents/CustomButton";
import CustomSelect from "../customComponents/CustomSelect";
import { appColors } from "@/lib/theme";

const ITEMS_PER_PAGE = 10000000000;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [systemRoles, setSystemRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  );

  // Predefined system roles
  const availableRoles = [
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'end-user', label: 'End User' }
  ];

  const columns = [
    { label: "Email", id: "email" },
    { label: "Title", id: "title_roles" },
    { label: "System Roles", id: "system_roles" },
    { label: "Last Sign In", id: "last_sign_in_at" },
    { label: "Created At", id: "created_at" },
    { label: "Updated At", id: "updated_at" },
    { label: "Actions", id: "action" },
  ];

  const arrayFields = ["title_roles", "system_roles"];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { users: fetchedUsers, error } = await getAllUsers();

      if (error) throw error;

      const formattedUsers = fetchedUsers.map((user) => {
        const titleRoles = Array.isArray(user.user_metadata?.title_roles)
          ? user.user_metadata.title_roles
          : user.user_metadata?.title_roles
            ? [user.user_metadata.title_roles]
            : [];

        const systemRoles = Array.isArray(user.user_metadata?.system_roles)
          ? user.user_metadata.system_roles
          : user.user_metadata?.system_roles
            ? [user.user_metadata.system_roles]
            : [];

        return {
          ...user,
          title_roles: titleRoles.map((item, idx) => (
            <span
              key={idx}
              className={`inline-block px-2 py-1 my-2 text-xs font-semibold rounded-lg mr-1 ${getRandomColor(idx)}`}
            >
              {item}
            </span>
          )),
          system_roles: systemRoles.map((item, idx) => (
            <span
              key={idx}
              className={`inline-block px-2 py-1 my-2 text-xs font-semibold rounded-lg mr-1 ${getRandomColor(idx)}`}
            >
              {item}
            </span>
          )),
        };
      });

      setUsers(formattedUsers);
      setTotalRecords(formattedUsers.length);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditClick = (user) => {
    const currentRoles = user.user_metadata?.system_roles || [];
    setCurrentUser(user);
    setSelectedRoles(currentRoles);
    setShowEditModal(true);
  };

  const handleUpdateRoles = async () => {
    try {
      if (!currentUser) return;

      const { error } = await supabase.auth.admin.updateUserById(
        currentUser.id,
        {
          user_metadata: {
            ...currentUser.user_metadata,
            system_roles: selectedRoles
          }
        }
      );

      if (error) throw error;

      Alert.show('Success', 'User role updated successfully.', [
        {
          text: 'OK',
          primary: true,
        },
      ]);
      fetchUsers();
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating user:", err);

    }
  };

  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return ( true ? null :
    <div className="w-[90%] mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>

      <div className="max-w-full mx-auto">
        <div className="overflow-x-auto rounded-[15px] overflow-y-auto">
          <DraggableTable
            columns={columns}
            data={paginatedUsers}
            arrayFields={arrayFields}
            loading={loading}
            onEdit={handleEditClick}
            showActions={true}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            totalRecords={totalRecords}
            showPagination={true}
          />
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md" style={{ backgroundColor: appColors.primaryColor }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold border-b w-full">Update System Roles</h2>
            </div>
            <div className="mb-6 p-4 rounded-lg shadow-sm border border-gray-100" style={{ backgroundColor: appColors.primaryColor }}>
              <div className="flex items-start gap-4">
                {/* User Avatar/Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1" >
                  <h3 className="text-lg  font-medium text-gray-300 ">{currentUser.email}</h3>

                  <div className="mt-2 flex items-center">
                    <span className="text-sm font-medium text-gray-300 mr-2">Current Roles:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedRoles.length > 0 ? (
                        selectedRoles.map(role => (
                          <span
                            key={role}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">No roles assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 -mt-2">
              <div className="space-y-2">
                <CustomSelect
                  id="roles"
                  title="Select Roles"
                  value={selectedRoles}
                  onChange={(selected) => setSelectedRoles(selected)}
                  placeholder="Select Role"
                  options={availableRoles}
                  isMulti={true}
                // className="w-full mb-2 "
                />

              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <CustomButton
                title={"Cancel"}
                onClick={() => setShowEditModal(false)}
              />
              <CustomButton
                title={" Update Roles"}
                onClick={handleUpdateRoles}
              />

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;