import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { attendanceApi, groupsApi, usersApi } from '../../lib/api';

interface AttendanceFormProps {
  attendance?: any;
  onSuccess: () => void;
}

export default function AttendanceForm({ attendance, onSuccess }: AttendanceFormProps) {
  const [formData, setFormData] = useState({
    studentId: attendance?.studentId?._id || attendance?.studentId || '',
    groupId: attendance?.groupId?._id || attendance?.groupId || '',
    date: attendance?.date ? new Date(attendance.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: attendance?.status || 'present',
    arrivalTime: attendance?.arrivalTime || '',
    departureTime: attendance?.departureTime || '',
    lessonTopic: attendance?.lessonTopic || '',
    notes: attendance?.notes || '',
  });

  const queryClient = useQueryClient();

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getAll().then(res => res.data),
  });

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => usersApi.getStudents().then(res => res.data),
  });

  const mutation = useMutation({
    mutationFn: attendance 
      ? (data: any) => attendanceApi.update(attendance._id, data)
      : attendanceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filter students based on selected group
  const filteredStudents = students?.filter((student: any) => {
    if (!formData.groupId) return true;
    const selectedGroup = groups?.find((g: any) => g._id === formData.groupId);
    return selectedGroup?.studentIds?.some((s: any) => s._id === student._id);
  }) || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Guruh</label>
          <select
            name="groupId"
            required
            className="input mt-1"
            value={formData.groupId}
            onChange={handleChange}
          >
            <option value="">Guruhni tanlang</option>
            {groups?.map((group: any) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">O'quvchi</label>
          <select
            name="studentId"
            required
            className="input mt-1"
            value={formData.studentId}
            onChange={handleChange}
          >
            <option value="">O'quvchini tanlang</option>
            {filteredStudents.map((student: any) => (
              <option key={student._id} value={student._id}>
                {student.firstName} {student.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Sana</label>
          <input
            type="date"
            name="date"
            required
            className="input mt-1"
            value={formData.date}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Holat</label>
          <select
            name="status"
            required
            className="input mt-1"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="present">Kelgan</option>
            <option value="absent">Kelmagan</option>
            <option value="late">Kech qolgan</option>
            <option value="excused">Uzrli</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Kelish vaqti</label>
          <input
            type="time"
            name="arrivalTime"
            className="input mt-1"
            value={formData.arrivalTime}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ketish vaqti</label>
          <input
            type="time"
            name="departureTime"
            className="input mt-1"
            value={formData.departureTime}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Dars mavzusi</label>
        <input
          type="text"
          name="lessonTopic"
          className="input mt-1"
          placeholder="Masalan: Present Perfect Tense"
          value={formData.lessonTopic}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Izoh</label>
        <textarea
          name="notes"
          rows={3}
          className="input mt-1"
          placeholder="Qo'shimcha izohlar"
          value={formData.notes}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onSuccess}
          className="btn-secondary"
        >
          Bekor qilish
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="btn-primary"
        >
          {mutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>
    </form>
  );
}