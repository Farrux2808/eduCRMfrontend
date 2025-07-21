import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { gradesApi, groupsApi } from '../../lib/api';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';
import GradeForm from './GradeForm';
import BulkGradeForm from './BulkGradeForm';
import { formatDate } from '../../lib/utils';

export default function Grades() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const queryClient = useQueryClient();

  const { data: grades, isLoading } = useQuery({
    queryKey: ['grades', selectedGroupId],
    queryFn: () => selectedGroupId 
      ? gradesApi.getByGroup(selectedGroupId).then(res => res.data)
      : gradesApi.getAll().then(res => res.data),
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getAll().then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: gradesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
    },
  });

  const handleEdit = (grade: any) => {
    setEditingGrade(grade);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bahoni o\'chirmoqchimisiz?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGrade(null);
  };

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
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
      key: 'subject',
      title: 'Fan',
      render: (value: string) => value,
    },
    {
      key: 'grade',
      title: 'Baho',
      render: (value: number, record: any) => (
        <div>
          <span className={`text-lg font-bold ${getGradeColor(value, record.maxGrade)}`}>
            {value}/{record.maxGrade}
          </span>
          <p className="text-sm text-gray-500">
            {Math.round((value / record.maxGrade) * 100)}%
          </p>
        </div>
      ),
    },
    {
      key: 'date',
      title: 'Sana',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'gradeType',
      title: 'Turi',
      render: (value: string) => value || '-',
    },
    {
      key: 'comment',
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
          <h1 className="text-2xl font-bold text-gray-900">Baholar</h1>
          <p className="text-gray-600">O'quvchilar baholarini boshqarish</p>
        </div>
        <div className="flex space-x-3">
          <select
            className="input"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
          >
            <option value="">Barcha guruhlar</option>
            {groups?.map((group: any) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="btn-secondary"
          >
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Guruh baholari
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Baho qo'shish
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        data={grades || []}
        loading={isLoading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingGrade ? 'Bahoni tahrirlash' : 'Baho qo\'shish'}
        size="lg"
      >
        <GradeForm
          grade={editingGrade}
          onSuccess={handleCloseModal}
        />
      </Modal>

      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Guruh baholari"
        size="xl"
      >
        <BulkGradeForm
          onSuccess={() => setIsBulkModalOpen(false)}
        />
      </Modal>
    </div>
  );
}