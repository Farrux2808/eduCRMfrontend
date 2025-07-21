import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { groupsApi, usersApi, coursesApi } from '../../lib/api';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';
import GroupForm from './GroupForm';
import { formatDate, getStatusColor } from '../../lib/utils';

export default function Groups() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getAll().then(res => res.data),
  });

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => usersApi.getStudents().then(res => res.data),
  });

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getAll().then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: groupsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const addStudentMutation = useMutation({
    mutationFn: ({ groupId, studentId }: { groupId: string; studentId: string }) =>
      groupsApi.addStudent(groupId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setIsStudentModalOpen(false);
    },
  });

  const removeStudentMutation = useMutation({
    mutationFn: ({ groupId, studentId }: { groupId: string; studentId: string }) =>
      groupsApi.removeStudent(groupId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const handleEdit = (group: any) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Guruhni o\'chirmoqchimisiz?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
  };

  const handleManageStudents = (group: any) => {
    setSelectedGroup(group);
    setIsStudentModalOpen(true);
  };

  const handleAddStudent = (studentId: string) => {
    if (selectedGroup) {
      addStudentMutation.mutate({ groupId: selectedGroup._id, studentId });
    }
  };

  const handleRemoveStudent = (studentId: string) => {
    if (selectedGroup && window.confirm('O\'quvchini guruhdan chiqarmoqchimisiz?')) {
      removeStudentMutation.mutate({ groupId: selectedGroup._id, studentId });
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Guruh nomi',
      render: (value: string, record: any) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-gray-500">
            {courses?.find(c => c._id === record.courseId)?.name || 'Noma\'lum kurs'}
          </p>
        </div>
      ),
    },
    {
      key: 'teacherId',
      title: 'O\'qituvchi',
      render: (value: any) => (
        <div>
          <p className="font-medium">{value?.firstName} {value?.lastName}</p>
          <p className="text-sm text-gray-500">{value?.email}</p>
        </div>
      ),
    },
    {
      key: 'studentIds',
      title: 'O\'quvchilar',
      render: (value: any[]) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value?.length || 0} ta o'quvchi
        </span>
      ),
    },
    {
      key: 'startDate',
      title: 'Boshlanish',
      render: (value: string) => formatDate(value),
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
            onClick={() => handleManageStudents(record)}
            className="text-green-600 hover:text-green-800"
            title="O'quvchilarni boshqarish"
          >
            <UserPlusIcon className="h-4 w-4" />
          </button>
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

  const availableStudents = students?.filter(student => 
    !selectedGroup?.studentIds?.some((s: any) => s._id === student._id)
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guruhlar</h1>
          <p className="text-gray-600">O'quv guruhlarini boshqarish</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Yangi guruh
        </button>
      </div>

      <Table
        columns={columns}
        data={groups || []}
        loading={isLoading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingGroup ? 'Guruhni tahrirlash' : 'Yangi guruh'}
        size="lg"
      >
        <GroupForm
          group={editingGroup}
          onSuccess={handleCloseModal}
        />
      </Modal>

      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title="O'quvchilarni boshqarish"
        size="lg"
      >
        {selectedGroup && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">
                {selectedGroup.name} - O'quvchilar
              </h3>
              
              {/* Current Students */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">Joriy o'quvchilar</h4>
                {selectedGroup.studentIds?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedGroup.studentIds.map((student: any) => (
                      <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(student._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <UserMinusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Hech qanday o'quvchi yo'q</p>
                )}
              </div>

              {/* Available Students */}
              <div>
                <h4 className="text-md font-medium mb-2">Qo'shish mumkin bo'lgan o'quvchilar</h4>
                {availableStudents.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availableStudents.map((student: any) => (
                      <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                        <button
                          onClick={() => handleAddStudent(student._id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <UserPlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Qo'shish uchun o'quvchi yo'q</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}