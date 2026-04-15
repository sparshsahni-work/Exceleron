// File: frontend/src/DashboardComponents/UserProfile.jsx
// This file has been corrected to work with your state store and user model.

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Edit2, Save, X, Calendar, Mail, Key } from 'lucide-react';
import { useApiStore } from '../store/apiStore'; // FIX #1: Added the missing import for the apiStore.

const UserProfile = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(user);
  
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestReason, setRequestReason] = useState('');

  // This now works because the store is imported correctly.
  const { requestAdminAccess } = useApiStore();

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(user);
    setIsEditing(false);
  };

  const handleRequestSubmit = () => {
    if (requestReason) {
        requestAdminAccess(requestReason);
        setShowRequestModal(false);
    }
  };

  // Defensive check in case user prop is not yet available
  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">User Profile</h2>
        <p className="text-gray-400">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <motion.div
          className="lg:col-span-2 bg-gray-800 p-6 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Profile Information</h3>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </motion.button>
                  <motion.button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </motion.button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-white"
                />
              ) : (
                <p className="text-gray-300">{user.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <p className="text-gray-300">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <p className="text-gray-300 capitalize">{user.role}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Member Since</label>
              {/* FIX #2: Changed user.joinDate to user.createdAt to match the backend model. */}
              <p className="text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Stats */}

<motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">

              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-400">{user.role}</p>
              </div>
            </div>
            
          </div>

          <div className="bg-gray-800 h-70 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Recent Activity</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Uploaded sales.xlsx</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Created bar chart</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Downloaded report.pdf</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- ADMIN REQUEST SECTION --- */}
      {user.role === 'user' && (
        <motion.div
            className="bg-gray-800 p-6 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
            <h3 className="text-lg font-semibold text-white mb-2">Admin Access</h3>
            {user.adminRequestStatus === 'none' && (
                <>
                    <p className="text-gray-300 mb-4">
                        Request administrative privileges to manage users and system settings.
                    </p>
                    <motion.button
                        onClick={() => setShowRequestModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Key className="w-4 h-4" />
                        <span>Request Admin Access</span>
                    </motion.button>
                </>
            )}
            {user.adminRequestStatus === 'pending' && (
                <p className="text-yellow-400">Your request for admin access is pending review.</p>
            )}
            {user.adminRequestStatus === 'denied' && (
                 <p className="text-red-400">Your previous request for admin access was denied.</p>
            )}
        </motion.div>
      )}

      {/* --- REQUEST MODAL --- */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
                className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <h3 className="text-lg font-semibold mb-4">Request Admin Access</h3>
                <p className="text-gray-300 mb-4">
                    Please provide a reason for requesting admin privileges. This will be sent to the current administrator for review.
                </p>
                <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="e.g., I am a team lead and need to manage my team's accounts."
                    className="w-full h-24 p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-white"
                />
                <div className="flex justify-end space-x-4 mt-4">
                    <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Cancel</button>
                    <button onClick={handleRequestSubmit} disabled={!requestReason} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Submit Request</button>
                </div>
            </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
