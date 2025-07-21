import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { attendanceApi, groupsApi } from '../../lib/api';

interface BulkAttendanceFormProps {
  onSuccess: () => void;
}

export default function BulkAttendanceForm({ onSuccess }: BulkAttendanceFormProps) {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lessonTopic, setLessonTopic] = useState('');
  const [studentAttendance, setStudentAttendance] = useState<Record<string, any>>({});

  const queryClient = useQueryClient();

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getAll().then(res => res.data),
  });

  const selectedGroup = groups?.find((g: any) => g._id === selectedGroupId);

  const mutation = useMutation({
    mutationFn: attendanceApi.bulkCreate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      onSuccess();
    },
  });

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    setStudentAttendance({});
  };

  const handleStudentStatusChange = (studentId: string, field: string, value: string) => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGroup) return;

    const attendanceData = selectedGroup.studentIds.map((student: any) => ({
      studentId: student._id,
      groupId: selectedGroupId,
      date,
      status: studentAttendance[student._id]?.status || 'present',
      arrivalTime: studentAttendance[student._id]?.arrivalTime || '',
      notes: studentAttendance[student._id]?.notes || '',
      lessonTopic,
    }));

    mutation.mutate(attendanceData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Guruh</label>
          <select
            required
            className="input mt-1"
            value={selectedGroupId}
            onChange={(e) => handleGroupChange(e.target.value)}
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
          <label className="block text-sm font-medium text-gray-700">Sana</label>
          <input
            type="date"
            required
            className="input mt-1"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Dars mavzusi</label>
        <input
          type="text"
          className="input mt-1"
          placeholder="Masalan: Present Perfect Tense"
          value={lessonTopic}
          onChange={(e) => setLessonTopic(e.target.value)}
        />
      </div>

      {selectedGroup && selectedGroup.studentIds && selectedGroup.studentIds.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">O'quvchilar davomati</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedGroup.studentIds.map((student: any) => (
              <div key={student._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Holat</label>
                    <select
                      className="input text-sm"
                      value={studentAttendance[student._id]?.status || 'present'}
                      onChange={(e) => handleStudentStatusChange(student._id, 'status', e.target.value)}
                    >
                      <option value="present">Kelgan</option>
                      <option value="absent">Kelmagan</option>
                      <option value="late">Kech qolgan</option>
                      <option value="excused">Uzrli</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Kelish vaqti</label>
                    <input
                      type="time"
                      className="input text-sm"
                      value={studentAttendance[student._id]?.arrivalTime || ''}
                      onChange={(e) => handleStudentStatusChange(student._id, 'arrivalTime', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Izoh</label>
                    <input
                      type="text"
                      className="input text-sm"
                      placeholder="Izoh"
                      value={studentAttendance[student._id]?.notes || ''}
                      onChange={(e) => handleStudentStatusChange(student._id, 'notes', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          disabled={mutation.isPending || !selectedGroup}
          className="btn-primary"
        >
          {mutation.isPending ? 'Saqlanmoqda...' : 'Davomatni saqlash'}
        </button>
      </div>
    </form>
  );
}