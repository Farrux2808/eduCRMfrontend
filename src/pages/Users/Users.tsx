import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { usersApi } from '../../lib/api';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';
import UserForm from './UserForm';
import { formatDate, getRoleColor } from '../../lib/utils';

export default function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll().then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Foydalanuvchini o\'chirmoqchimisiz?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const columns = [
    {
      key: 'firstName',
      title: 'Ism',
      render: (value: string, record: any) => (
        <div>
          <p className="font-medium">{record.firstName} {record.lastName}</p>
          <p className="text-sm text-gray-500">{record.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Rol',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(value)}`}>
          {value === 'admin' ? 'Admin' : 
           value === 'teacher' ? 'O\'qituvchi' : 
           value === 'student' ? 'O\'quvchi' : 'Ota-ona'}
        </span>
      ),
    },
    {
      key: 'phone',
      title: 'Telefon',
      render: (value: string) => value || '-',
    },
    {
      key: 'isActive',
      title: 'Holat',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Faol' : 'Nofaol'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Yaratilgan',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'actions',
      title: 'Amallar',
      render: (_: any, record: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(record)}
            className="text-blue-600 hover:text-blue-800"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(record._id)}
            className="text-red-600 hover:text-red-800"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Foydalanuvchilar</h1>
          <p className="text-gray-600">Tizim foydalanuvchilarini boshqarish</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Yangi foydalanuvchi
        </button>
      </div>

      <Table
        columns={columns}
        data={users || []}
        loading={isLoading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'}
        size="lg"
      >
        <UserForm
          user={editingUser}
          onSuccess={handleCloseModal}
        />
      </Modal>
    </div>
  );
}