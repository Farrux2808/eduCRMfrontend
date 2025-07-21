import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { groupsApi, coursesApi, usersApi } from '../../lib/api';

interface GroupFormProps {
  group?: any;
  onSuccess: () => void;
}

export default function GroupForm({ group, onSuccess }: GroupFormProps) {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    courseId: group?.courseId || '',
    teacherId: group?.teacherId?._id || group?.teacherId || '',
    startDate: group?.startDate ? new Date(group.startDate).toISOString().split('T')[0] : '',
    endDate: group?.endDate ? new Date(group.endDate).toISOString().split('T')[0] : '',
    maxStudents: group?.maxStudents || '',
    description: group?.description || '',
    room: group?.room || '',
    lessonsPerWeek: group?.lessonsPerWeek || 3,
    lessonDuration: group?.lessonDuration || 90,
    isActive: group?.isActive ?? true,
  });

  const queryClient = useQueryClient();

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getAll().then(res => res.data),
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => usersApi.getTeachers().then(res => res.data),
  });

  const mutation = useMutation({
    mutationFn: group 
      ? (data: any) => groupsApi.update(group._id, data)
      : groupsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData };
    
    // Convert numbers
    if (submitData.maxStudents) {
      submitData.maxStudents = Number(submitData.maxStudents);
    }
    submitData.lessonsPerWeek = Number(submitData.lessonsPerWeek);
    submitData.lessonDuration = Number(submitData.lessonDuration);

    mutation.mutate(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Guruh nomi</label>
        <input
          type="text"
          name="name"
          required
          className="input mt-1"
          placeholder="Masalan: English Beginner A1"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Kurs</label>
          <select
            name="courseId"
            required
            className="input mt-1"
            value={formData.courseId}
            onChange={handleChange}
          >
            <option value="">Kursni tanlang</option>
            {courses?.map((course: any) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">O'qituvchi</label>
          <select
            name="teacherId"
            required
            className="input mt-1"
            value={formData.teacherId}
            onChange={handleChange}
          >
            <option value="">O'qituvchini tanlang</option>
            {teachers?.map((teacher: any) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Boshlanish sanasi</label>
          <input
            type="date"
            name="startDate"
            required
            className="input mt-1"
            value={formData.startDate}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tugash sanasi</label>
          <input
            type="date"
            name="endDate"
            className="input mt-1"
            value={formData.endDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Maksimal o'quvchilar soni</label>
          <input
            type="number"
            name="maxStudents"
            min="1"
            className="input mt-1"
            placeholder="15"
            value={formData.maxStudents}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Xona</label>
          <input
            type="text"
            name="room"
            className="input mt-1"
            placeholder="Room 101"
            value={formData.room}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Haftada darslar soni</label>
          <input
            type="number"
            name="lessonsPerWeek"
            min="1"
            max="7"
            required
            className="input mt-1"
            value={formData.lessonsPerWeek}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dars davomiyligi (daqiqa)</label>
          <input
            type="number"
            name="lessonDuration"
            min="30"
            max="180"
            required
            className="input mt-1"
            value={formData.lessonDuration}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tavsif</label>
        <textarea
          name="description"
          rows={3}
          className="input mt-1"
          placeholder="Guruh haqida qo'shimcha ma'lumot"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          id="isActive"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          checked={formData.isActive}
          onChange={handleChange}
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
          Faol
        </label>
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