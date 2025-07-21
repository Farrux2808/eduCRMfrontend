import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { attendanceApi, groupsApi } from '../../lib/api';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';
import AttendanceForm from './AttendanceForm';
import BulkAttendanceForm from './BulkAttendanceForm';
import { formatDate, getStatusColor } from '../../lib/utils';

export default function Attendance() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const queryClient = useQueryClient();

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', selectedDate],
    queryFn: () => attendanceApi.getByDate(selectedDate).then(res => res.data),
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getAll().then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: attendanceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  const handleEdit = (attendance: any) => {
    setEditingAttendance(attendance);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Davomat yozuvini o\'chirmoqchimisiz?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAttendance(null);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'Kelgan';
      case 'absent': return 'Kelmagan';
      case 'late': return 'Kech qolgan';
      case 'excused': return 'Uzrli';
      default: return status;
    }
  };

  const columns = [
    {
      key: 'studentId',
      title: 'O\'quvchi',
      render: (value: any) => (
        <div>
          <p className="font-medium">{value?.firstName} {value?.lastName}</p>
          <p className="text-sm text-gray-500">{value?.email}</p>
        </div>
      ),
    },
    {
      key: 'groupId',
      title: 'Guruh',
      render: (value: any) => (
        <div>
          <p className="font-medium">{value?.name}</p>
          <p className="text-sm text-gray-500">{value?.courseId?.name}</p>
        </div>
      ),
    },
    {
      key: 'date',
      title: 'Sana',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'status',
      title: 'Holat',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {getStatusText(value)}
        </span>
      ),
    },
    {
      key: 'arrivalTime',
      title: 'Kelish vaqti',
      render: (value: string) => value || '-',
    },
    {
      key: 'lessonTopic',
      title: 'Dars mavzusi',
      render: (value: string) => value || '-',
    },
    {
      key: 'notes',
      title: 'Izoh',
      render: (value: string) => value || '-',
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
          <h1 className="text-2xl font-bold text-gray-900">Davomat</h1>
          <p className="text-gray-600">O'quvchilar davomatini boshqarish</p>
        </div>
        <div className="flex space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input"
          />
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="btn-secondary"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Guruh davomati
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Davomat qo'shish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Kelgan</p>
          <p className="text-2xl font-bold text-green-900">
            {attendance?.filter((a: any) => a.status === 'present').length || 0}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600">Kelmagan</p>
          <p className="text-2xl font-bold text-red-900">
            {attendance?.filter((a: any) => a.status === 'absent').length || 0}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600">Kech qolgan</p>
          <p className="text-2xl font-bold text-yellow-900">
            {attendance?.filter((a: any) => a.status === 'late').length || 0}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Uzrli</p>
          <p className="text-2xl font-bold text-blue-900">
            {attendance?.filter((a: any) => a.status === 'excused').length || 0}
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        data={attendance || []}
        loading={isLoading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAttendance ? 'Davomatni tahrirlash' : 'Davomat qo\'shish'}
        size="lg"
      >
        <AttendanceForm
          attendance={editingAttendance}
          onSuccess={handleCloseModal}
        />
      </Modal>

      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Guruh davomati"
        size="xl"
      >
        <BulkAttendanceForm
          onSuccess={() => setIsBulkModalOpen(false)}
        />
      </Modal>
    </div>
  );
}