import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { coursesApi } from '../../lib/api';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';
import CourseForm from './CourseForm';
import { formatCurrency, getStatusColor } from '../../lib/utils';

export default function Courses() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getAll().then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: coursesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Kursni o\'chirmoqchimisiz?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const columns = [
    {
      key: 'name',
      title: 'Kurs nomi',
      render: (value: string, record: any) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-gray-500">{record.description}</p>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Kategoriya',
      render: (value: string) => value || '-',
    },
    {
      key: 'level',
      title: 'Daraja',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'beginner' ? 'bg-green-100 text-green-800' :
          value === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
          value === 'advanced' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value === 'beginner' ? 'Boshlang\'ich' :
           value === 'intermediate' ? 'O\'rta' :
           value === 'advanced' ? 'Yuqori' : value || '-'}
        </span>
      ),
    },
    {
      key: 'duration',
      title: 'Davomiyligi',
      render: (value: number) => `${value} oy`,
    },
    {
      key: 'price',
      title: 'Narx',
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'maxStudents',
      title: 'Maks. o\'quvchi',
      render: (value: number) => value || '-',
    },
    {
      key: 'isActive',
      title: 'Holat',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value ? 'active' : 'inactive')}`}>
          {value ? 'Faol' : 'Nofaol'}
        </span>
      ),
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
          <h1 className="text-2xl font-bold text-gray-900">Kurslar</h1>
          <p className="text-gray-600">O'quv kurslarini boshqarish</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Yangi kurs
        </button>
      </div>

      <Table
        columns={columns}
        data={courses || []}
        loading={isLoading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCourse ? 'Kursni tahrirlash' : 'Yangi kurs'}
        size="lg"
      >
        <CourseForm
          course={editingCourse}
          onSuccess={handleCloseModal}
        />
      </Modal>
    </div>
  );
}