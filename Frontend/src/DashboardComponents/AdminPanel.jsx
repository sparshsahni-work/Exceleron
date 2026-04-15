
// File: frontend/src/DashboardComponents/AdminPanel.jsx
// This is the final, fully functional Admin Panel component, integrated with the backend API.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Activity, 
  Trash2, 
  Edit3, 
  Search,
  Filter,
  Check,
  X,
  Database,
  TrendingUp
} from 'lucide-react';
import { useApiStore } from '../store/apiStore'; // Import the store to get live data and actions

// --- Sub-component for displaying admin requests ---
const AdminRequests = ({ requests, onRespond }) => {
    if (!requests || requests.length === 0) {
        return <div className="text-center p-8 bg-gray-800 rounded-lg">No pending admin requests.</div>;
    }
    return (
        <div className="space-y-4">
            {requests.map(req => (
                <motion.div key={req._id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div>
                        <p className="font-bold">{req.name} ({req.email})</p>
                        <p className="text-sm text-gray-400 mt-2"><strong>Reason:</strong> {req.adminRequestReason}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => onRespond(req._id, 'approve')} className="p-2 bg-green-600 rounded-lg hover:bg-green-700"><Check /></button>
                        <button onClick={() => onRespond(req._id, 'deny')} className="p-2 bg-red-600 rounded-lg hover:bg-red-700"><X /></button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

const AdminPanel = () => {
  // --- State Management ---
  // The 'users' state is now managed by the Zustand store.
  const { users, fetchUsers, deleteUser, updateUserRole, getAdminRequests, respondToAdminRequest } = useApiStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState('users');
  const [adminRequests, setAdminRequests] = useState([]);

  // --- Data Fetching ---
  // This effect runs when the component mounts to fetch real user data and admin requests.
  useEffect(() => {
    fetchUsers();
    const fetchRequests = async () => {
        const requests = await getAdminRequests();
        setAdminRequests(requests);
    };
    fetchRequests();
  }, [fetchUsers, getAdminRequests]);

  // --- Event Handlers ---
  // These handlers now call functions from the store to interact with the API.
  const handleDeleteUser = (userId) => {
    deleteUser(userId);
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const handleRoleChange = (userId, newRole) => {
    updateUserRole(userId, newRole);
    setShowRoleModal(false);
    setSelectedUser(null);
  };

  const handleRespond = async (userId, action) => {
    await respondToAdminRequest(userId, action);
    setAdminRequests(prev => prev.filter(req => req._id !== userId));
  };

  // --- Data Processing ---
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    totalFiles: users.reduce((sum, u) => sum + (u.analytics?.filesUploaded || 0), 0),
    totalCharts: users.reduce((sum, u) => sum + (u.analytics?.chartsCreated || 0), 0)
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Admin Panel</h2>
        <p className="text-gray-400">Manage users and monitor platform activity</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div className="bg-gray-800 p-4 rounded-lg" whileHover={{ scale: 1.02 }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </motion.div>
        <motion.div className="bg-gray-800 p-4 rounded-lg" whileHover={{ scale: 1.02 }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-green-400">{stats.activeUsers}</p>
            </div>
            <Activity className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
        <motion.div className="bg-gray-800 p-4 rounded-lg" whileHover={{ scale: 1.02 }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Admins</p>
              <p className="text-2xl font-bold text-blue-400">{stats.adminUsers}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>
        <motion.div className="bg-gray-800 p-4 rounded-lg" whileHover={{ scale: 1.02 }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Charts Created</p>
              <p className="text-2xl font-bold">{stats.totalCharts}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
        </motion.div>
      </div>

      {/* --- Tabbed Navigation --- */}
      <div className="flex border-b border-gray-700">
          <button onClick={() => setActiveAdminTab('users')} className={`px-4 py-2 ${activeAdminTab === 'users' ? 'border-b-2 border-white' : 'text-gray-400'}`}>User Management</button>
          <button onClick={() => setActiveAdminTab('requests')} className={`relative px-4 py-2 ${activeAdminTab === 'requests' ? 'border-b-2 border-white' : 'text-gray-400'}`}>
              Admin Requests
              {adminRequests.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{adminRequests.length}</span>
              )}
          </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
            key={activeAdminTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            {activeAdminTab === 'users' && (
                <div className="space-y-6">
                    {/* Search and Filter */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search users..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-white"
                            />
                          </div>
                          <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                              value={filterRole}
                              onChange={(e) => setFilterRole(e.target.value)}
                              className="pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-white appearance-none"
                            >
                              <option value="all">All Roles</option>
                              <option value="admin">Admin</option>
                              <option value="user">User</option>
                            </select>
                          </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <motion.div className="bg-gray-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Activity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Stats</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                              {filteredUsers.map((user, index) => (
                                <motion.tr key={user._id} className="hover:bg-gray-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">{user.name.charAt(0).toUpperCase()}</div>
                                      <div className="ml-4">
                                        <div className="text-sm font-medium">{user.name}</div>
                                        <div className="text-sm text-gray-400">{user.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700'}`}>{user.role}</span></td>
                                  <td className="px-6 py-4 text-sm text-gray-300">
                                    <div>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                                    <div>Last Login: {new Date(user.analytics.lastLogin).toLocaleDateString()}</div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-300">
                                    <div>Charts: {user.analytics.chartsCreated}</div>
                                  </td>
                                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${user.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{user.status}</span></td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                      <button onClick={() => { setSelectedUser(user); setShowRoleModal(true); }} className="text-blue-400 p-1 rounded hover:text-blue-300"><Edit3 className="w-4 h-4" /></button>
                                      <button onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }} className="text-red-400 p-1 rounded hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                    </motion.div>
                </div>
            )}

            {activeAdminTab === 'requests' && (
                <AdminRequests requests={adminRequests} onRespond={handleRespond} />
            )}
        </motion.div>
      </AnimatePresence>

      {/* Delete User Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <h3 className="text-lg font-semibold mb-4 text-red-400">Delete User</h3>
              <p className="text-gray-300 mb-6">Are you sure you want to delete <strong>{selectedUser.name}</strong>? This action is permanent.</p>
              <div className="flex justify-end space-x-4">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700">Cancel</button>
                <button onClick={() => handleDeleteUser(selectedUser._id)} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Role Change Modal */}
      <AnimatePresence>
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <h3 className="text-lg font-semibold mb-4">Change User Role</h3>
              <p className="text-gray-300 mb-6">Change role for <strong>{selectedUser.name}</strong>:</p>
              <div className="space-y-3 mb-6">
                <motion.button onClick={() => handleRoleChange(selectedUser._id, 'admin')} className={`w-full flex items-center space-x-3 p-3 rounded-lg ${selectedUser.role === 'admin' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Shield className="w-5 h-5" />
                  <span>Admin</span>
                </motion.button>
                <motion.button onClick={() => handleRoleChange(selectedUser._id, 'user')} className={`w-full flex items-center space-x-3 p-3 rounded-lg ${selectedUser.role === 'user' ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Users className="w-5 h-5" />
                  <span>User</span>
                </motion.button>
              </div>
              <div className="flex justify-end">
                <button onClick={() => setShowRoleModal(false)} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
























































// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   Users, 
//   Shield, 
//   Activity, 
//   Trash2, 
//   Edit3, 
//   Search,
//   Filter,
//   MoreVertical,
//   UserCheck,
//   UserX,
//   Database,
//   TrendingUp,
//   Eye
// } from 'lucide-react';
// import { useApiStore } from '../store/apiStore';

// const AdminPanel = () => {
//   const [users, setUsers] = useState([
//     {
//       id: '1',
//       name: 'Sparsh Sahni',
//       email: 'sparshsahni14feb2005@gmail.com',
//       role: 'admin',
//       joinDate: '2024-01-15',
//       lastActive: '2024-01-20',
//       filesUploaded: 1,
//       chartsCreated: 4,
//       status: 'active'
//     },
//     {
//       id: '2',
//       name: 'Jane Smith',
//       email: 'jane@example.com',
//       role: 'user',
//       joinDate: '2024-01-18',
//       lastActive: '2024-01-19',
//       filesUploaded: 1,
//       chartsCreated: 2,
//       status: 'active'
//     },
//     {
//       id: '3',
//       name: 'Bob Johnson',
//       email: 'bob@example.com',
//       role: 'user',
//       joinDate: '2024-01-10',
//       lastActive: '2024-01-18',
//       filesUploaded: 3,
//       chartsCreated: 10,
//       status: 'inactive'
//     }
//   ]);

//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterRole, setFilterRole] = useState('all');
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showRoleModal, setShowRoleModal] = useState(false);

//   const filteredUsers = users.filter(user => {
//     const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesRole = filterRole === 'all' || user.role === filterRole;
//     return matchesSearch && matchesRole;
//   });

//   const handleDeleteUser = (userId) => {
//     setUsers(users.filter(user => user.id !== userId));
//     setShowDeleteModal(false);
//     setSelectedUser(null);
//   };

//   const handleRoleChange = (userId, newRole) => {
//     setUsers(users.map(user => 
//       user.id === userId ? { ...user, role: newRole } : user
//     ));
//     setShowRoleModal(false);
//     setSelectedUser(null);
//   };

//   const stats = {
//     totalUsers: users.length,
//     activeUsers: users.filter(u => u.status === 'active').length,
//     adminUsers: users.filter(u => u.role === 'admin').length,
//     totalFiles: users.reduce((sum, u) => sum + u.filesUploaded, 0),
//     totalCharts: users.reduce((sum, u) => sum + u.chartsCreated, 0)
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-2xl font-bold mb-2">Admin Panel</h2>
//         <p className="text-gray-400">Manage users and monitor platform activity</p>
//       </div>

//       {/* Stats Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//         <motion.div
//           className="bg-gray-800 p-4 rounded-lg"
//           whileHover={{ scale: 1.02 }}
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-400">Total Users</p>
//               <p className="text-2xl font-bold">{stats.totalUsers}</p>
//             </div>
//             <Users className="w-8 h-8 text-gray-400" />
//           </div>
//         </motion.div>

//         <motion.div
//           className="bg-gray-800 p-4 rounded-lg"
//           whileHover={{ scale: 1.02 }}
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-400">Active Users</p>
//               <p className="text-2xl font-bold text-green-400">{stats.activeUsers}</p>
//             </div>
//             <Activity className="w-8 h-8 text-green-400" />
//           </div>
//         </motion.div>

//         <motion.div
//           className="bg-gray-800 p-4 rounded-lg"
//           whileHover={{ scale: 1.02 }}
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-400">Admins</p>
//               <p className="text-2xl font-bold text-blue-400">{stats.adminUsers}</p>
//             </div>
//             <Shield className="w-8 h-8 text-blue-400" />
//           </div>
//         </motion.div>

//         <motion.div
//           className="bg-gray-800 p-4 rounded-lg"
//           whileHover={{ scale: 1.02 }}
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-400">Files Uploaded</p>
//               <p className="text-2xl font-bold">{stats.totalFiles}</p>
//             </div>
//             <Database className="w-8 h-8 text-gray-400" />
//           </div>
//         </motion.div>

//         <motion.div
//           className="bg-gray-800 p-4 rounded-lg"
//           whileHover={{ scale: 1.02 }}
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-400">Charts Created</p>
//               <p className="text-2xl font-bold">{stats.totalCharts}</p>
//             </div>
//             <TrendingUp className="w-8 h-8 text-gray-400" />
//           </div>
//         </motion.div>
//       </div>

//       {/* Search and Filter */}
//       <div className="bg-gray-800 p-4 rounded-lg">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search users..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-white"
//             />
//           </div>
          
//           <div className="relative">
//             <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <select
//               value={filterRole}
//               onChange={(e) => setFilterRole(e.target.value)}
//               className="pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-white appearance-none"
//             >
//               <option value="all">All Roles</option>
//               <option value="admin">Admin</option>
//               <option value="user">User</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Users Table */}
//       <motion.div
//         className="bg-gray-800 rounded-lg overflow-hidden"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-700">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                   User
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                   Role
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                   Activity
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                   Stats
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-700">
//               {filteredUsers.map((user, index) => (
//                 <motion.tr
//                   key={user.id}
//                   className="hover:bg-gray-700 transition-colors"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                 >
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
//                         {user.name.charAt(0).toUpperCase()}
//                       </div>
//                       <div className="ml-4">
//                         <div className="text-sm font-medium text-white">{user.name}</div>
//                         <div className="text-sm text-gray-400">{user.email}</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                       user.role === 'admin' 
//                         ? 'bg-blue-900 text-blue-300' 
//                         : 'bg-gray-700 text-gray-300'
//                     }`}>
//                       {user.role}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                     <div>Joined: {new Date(user.joinDate).toLocaleDateString()}</div>
//                     <div>Last: {new Date(user.lastActive).toLocaleDateString()}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                     <div>Files: {user.filesUploaded}</div>
//                     <div>Charts: {user.chartsCreated}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                       user.status === 'active' 
//                         ? 'bg-green-900 text-green-300' 
//                         : 'bg-red-900 text-red-300'
//                     }`}>
//                       {user.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex items-center space-x-2">
//                       <motion.button
//                         onClick={() => {
//                           setSelectedUser(user);
//                           setShowRoleModal(true);
//                         }}
//                         className="text-blue-400 hover:text-blue-300 p-1 rounded"
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                       >
//                         <Edit3 className="w-4 h-4" />
//                       </motion.button>
//                       <motion.button
//                         onClick={() => {
//                           setSelectedUser(user);
//                           setShowDeleteModal(true);
//                         }}
//                         className="text-red-400 hover:text-red-300 p-1 rounded"
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </motion.button>
//                     </div>
//                   </td>
//                 </motion.tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </motion.div>

//       {/* Delete User Modal */}
//       <AnimatePresence>
//         {showDeleteModal && selectedUser && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <motion.div
//               className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4"
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//             >
//               <h3 className="text-lg font-semibold mb-4 text-red-400">Delete User</h3>
//               <p className="text-gray-300 mb-6">
//                 Are you sure you want to delete <strong>{selectedUser.name}</strong>? 
//                 This action cannot be undone and will remove all their data.
//               </p>
//               <div className="flex justify-end space-x-4">
//                 <button
//                   onClick={() => setShowDeleteModal(false)}
//                   className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleDeleteUser(selectedUser.id)}
//                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Role Change Modal */}
//       <AnimatePresence>
//         {showRoleModal && selectedUser && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <motion.div
//               className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4"
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//             >
//               <h3 className="text-lg font-semibold mb-4">Change User Role</h3>
//               <p className="text-gray-300 mb-6">
//                 Change role for <strong>{selectedUser.name}</strong>:
//               </p>
//               <div className="space-y-3 mb-6">
//                 <motion.button
//                   onClick={() => handleRoleChange(selectedUser.id, 'admin')}
//                   className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
//                     selectedUser.role === 'admin' 
//                       ? 'bg-blue-600 text-white' 
//                       : 'bg-gray-700 hover:bg-gray-600'
//                   }`}
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <Shield className="w-5 h-5" />
//                   <span>Admin</span>
//                 </motion.button>
//                 <motion.button
//                   onClick={() => handleRoleChange(selectedUser.id, 'user')}
//                   className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
//                     selectedUser.role === 'user' 
//                       ? 'bg-gray-600 text-white' 
//                       : 'bg-gray-700 hover:bg-gray-600'
//                   }`}
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <Users className="w-5 h-5" />
//                   <span>User</span>
//                 </motion.button>
//               </div>
//               <div className="flex justify-end">
//                 <button
//                   onClick={() => setShowRoleModal(false)}
//                   className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default AdminPanel;


































































// // File: frontend/src/DashboardComponents/AdminPanel.jsx
// // This is the final, fully functional Admin Panel component.

// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   Users, 
//   Shield, 
//   Activity, 
//   Trash2, 
//   Edit3, 
//   Search,
//   Filter,
//   Check,
//   X,
//   Database,
//   TrendingUp
// } from 'lucide-react';
// import { useApiStore } from '../store/apiStore'; // Import the store to get live data

// // --- NEW: Sub-component for displaying admin requests ---
// const AdminRequests = ({ requests, onRespond }) => {
//     if (!requests || requests.length === 0) {
//         return <div className="text-center p-8 bg-gray-800 rounded-lg">No pending admin requests.</div>;
//     }
//     return (
//         <div className="space-y-4">
//             {requests.map(req => (
//                 <motion.div key={req._id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//                     <div>
//                         <p className="font-bold">{req.name} ({req.email})</p>
//                         <p className="text-sm text-gray-400 mt-2"><strong>Reason:</strong> {req.adminRequestReason}</p>
//                     </div>
//                     <div className="flex space-x-2">
//                         <button onClick={() => onRespond(req._id, 'approve')} className="p-2 bg-green-600 rounded-lg hover:bg-green-700"><Check /></button>
//                         <button onClick={() => onRespond(req._id, 'deny')} className="p-2 bg-red-600 rounded-lg hover:bg-red-700"><X /></button>
//                     </div>
//                 </motion.div>
//             ))}
//         </div>
//     );
// };

// const AdminPanel = () => {
//   // --- State Management ---
//   // The 'users' state is now managed by the Zustand store.
//   const { users, fetchUsers, deleteUser, updateUserRole, getAdminRequests, respondToAdminRequest } = useApiStore();
  
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterRole, setFilterRole] = useState('all');
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showRoleModal, setShowRoleModal] = useState(false);
//   const [activeAdminTab, setActiveAdminTab] = useState('users');
//   const [adminRequests, setAdminRequests] = useState([]);

//   // --- Data Fetching ---
//   // This effect runs when the component mounts to fetch real data.
//   useEffect(() => {
//     fetchUsers();
//     const fetchRequests = async () => {
//         const requests = await getAdminRequests();
//         setAdminRequests(requests);
//     };
//     fetchRequests();
//   }, [fetchUsers, getAdminRequests]);

//   // --- Event Handlers ---
//   // These handlers now call functions from the store to interact with the API.
//   const handleDeleteUser = (userId) => {
//     deleteUser(userId);
//     setShowDeleteModal(false);
//     setSelectedUser(null);
//   };

//   const handleRoleChange = (userId, newRole) => {
//     updateUserRole(userId, newRole);
//     setShowRoleModal(false);
//     setSelectedUser(null);
//   };

//   const handleRespond = async (userId, action) => {
//     await respondToAdminRequest(userId, action);
//     setAdminRequests(prev => prev.filter(req => req._id !== userId));
//   };

//   // --- Data Processing ---
//   const filteredUsers = users.filter(user => {
//     const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesRole = filterRole === 'all' || user.role === filterRole;
//     return matchesSearch && matchesRole;
//   });

//   const stats = {
//     totalUsers: users.length,
//     activeUsers: users.filter(u => u.status === 'active').length,
//     adminUsers: users.filter(u => u.role === 'admin').length,
//     totalFiles: users.reduce((sum, u) => sum + (u.analytics?.filesUploaded || 0), 0),
//     totalCharts: users.reduce((sum, u) => sum + (u.analytics?.chartsCreated || 0), 0)
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-2xl font-bold mb-2">Admin Panel</h2>
//         <p className="text-gray-400">Manage users and monitor platform activity</p>
//       </div>

//       {/* Stats Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//         {/* ... (Your stats overview UI remains the same) ... */}
//       </div>

//       {/* --- Tabbed Navigation --- */}
//       <div className="flex border-b border-gray-700">
//           <button onClick={() => setActiveAdminTab('users')} className={`px-4 py-2 ${activeAdminTab === 'users' ? 'border-b-2 border-white' : 'text-gray-400'}`}>User Management</button>
//           <button onClick={() => setActiveAdminTab('requests')} className={`relative px-4 py-2 ${activeAdminTab === 'requests' ? 'border-b-2 border-white' : 'text-gray-400'}`}>
//               Admin Requests
//               {adminRequests.length > 0 && (
//                   <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{adminRequests.length}</span>
//               )}
//           </button>
//       </div>

//       <AnimatePresence mode="wait">
//         <motion.div
//             key={activeAdminTab}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//         >
//             {activeAdminTab === 'users' && (
//                 <div className="space-y-6">
//                     {/* Search and Filter */}
//                     <div className="bg-gray-800 p-4 rounded-lg">
//                         {/* ... (Your search and filter UI remains the same) ... */}
//                     </div>

//                     {/* Users Table */}
//                     <motion.div className="bg-gray-800 rounded-lg overflow-hidden">
//                         <div className="overflow-x-auto">
//                           <table className="w-full">
//                             <thead className="bg-gray-700">
//                                 <tr>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">User</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Activity</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Stats</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-700">
//                               {filteredUsers.map((user, index) => (
//                                 <motion.tr key={user._id} className="hover:bg-gray-700">
//                                   <td className="px-6 py-4">
//                                     <div className="flex items-center">
//                                       <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">{user.name.charAt(0).toUpperCase()}</div>
//                                       <div className="ml-4">
//                                         <div className="text-sm font-medium">{user.name}</div>
//                                         <div className="text-sm text-gray-400">{user.email}</div>
//                                       </div>
//                                     </div>
//                                   </td>
//                                   <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700'}`}>{user.role}</span></td>
//                                   <td className="px-6 py-4 text-sm text-gray-300">
//                                     <div>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
//                                     <div>Last Login: {new Date(user.analytics.lastLogin).toLocaleDateString()}</div>
//                                   </td>
//                                   <td className="px-6 py-4 text-sm text-gray-300">
//                                     <div>Files: {user.analytics.filesUploaded}</div>
//                                     <div>Charts: {user.analytics.chartsCreated}</div>
//                                   </td>
//                                   <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${user.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{user.status}</span></td>
//                                   <td className="px-6 py-4">
//                                     <div className="flex items-center space-x-2">
//                                       <button onClick={() => { setSelectedUser(user); setShowRoleModal(true); }} className="text-blue-400 p-1 rounded hover:text-blue-300"><Edit3 className="w-4 h-4" /></button>
//                                       <button onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }} className="text-red-400 p-1 rounded hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
//                                     </div>
//                                   </td>
//                                 </motion.tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         </div>
//                     </motion.div>
//                 </div>
//             )}

//             {activeAdminTab === 'requests' && (
//                 <AdminRequests requests={adminRequests} onRespond={handleRespond} />
//             )}
//         </motion.div>
//       </AnimatePresence>

//       {/* Modals for Delete and Role Change */}
//       {/* ... (Your existing modal JSX remains the same, it will work with the updated handlers) ... */}

//     </div>
//   );
// };

// export default AdminPanel;
