"use client";

import { useState, useEffect } from "react";

interface Teacher {
  id: string;
  name: string;
  lastName: string;
  availableDays: number[]; // 0-4 (lunes-viernes)
}

interface Subject {
  id: string;
  name: string;
  teacherId: string;
}

interface Year {
  id: string;
  level: number; // 1, 2, 3, etc
}

interface YearSubject {
  id: string;
  yearId: string;
  subjectId: string;
  hoursRequired: number;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface ScheduleEntry {
  id: string;
  timeSlotId: string;
  dayIndex: number; // 0-4 (lunes-viernes)
  teacherId: string;
  subjectId: string;
  yearId: string;
}

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const TIME_SLOTS: TimeSlot[] = [
  { id: "1", startTime: "13:10", endTime: "14:10" },
  { id: "2", startTime: "14:10", endTime: "15:10" },
  { id: "3", startTime: "15:25", endTime: "16:25" },
  { id: "4", startTime: "16:35", endTime: "17:35" },
  { id: "5", startTime: "17:35", endTime: "18:35" },
];

export default function Home() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [yearSubjects, setYearSubjects] = useState<YearSubject[]>([]);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);

  const [teacherName, setTeacherName] = useState("");
  const [teacherLastName, setTeacherLastName] = useState("");
  const [teacherAvailableDays, setTeacherAvailableDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [tempAvailableDays, setTempAvailableDays] = useState<number[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [selectedTeacherForSubject, setSelectedTeacherForSubject] = useState("");
  const [newYearLevel, setNewYearLevel] = useState("");
  const [selectedYearForSubjects, setSelectedYearForSubjects] = useState("");
  const [selectedSubjectForYear, setSelectedSubjectForYear] = useState("");
  const [selectedSubjectHours, setSelectedSubjectHours] = useState("");
  const [view, setView] = useState<"teachers" | "admin" | "years" | "schedule">("teachers");
  const [isMounted, setIsMounted] = useState(false);

  // Cargar datos del localStorage al montar
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedTeachers = localStorage.getItem("teachers");
      const savedSubjects = localStorage.getItem("subjects");
      const savedYears = localStorage.getItem("years");
      const savedYearSubjects = localStorage.getItem("yearSubjects");
      const savedScheduleEntries = localStorage.getItem("scheduleEntries");

      if (savedTeachers) {
        const parsedTeachers = JSON.parse(savedTeachers) as Teacher[];
        const migratedTeachers = parsedTeachers.map((t) => ({
          ...t,
          lastName: t.lastName || "",
          availableDays: t.availableDays || [0, 1, 2, 3, 4],
        }));
        setTeachers(migratedTeachers);
      }
      if (savedSubjects) {
        // Limpiar la propiedad hoursByYear si existe (es obsoleta)
        const parsedSubjects = JSON.parse(savedSubjects) as any[];
        const cleanedSubjects = parsedSubjects.map((s) => ({
          id: s.id,
          name: s.name,
          teacherId: s.teacherId,
        }));
        setSubjects(cleanedSubjects);
      }
      if (savedYears) setYears(JSON.parse(savedYears));
      if (savedYearSubjects) setYearSubjects(JSON.parse(savedYearSubjects));
      if (savedScheduleEntries) {
        // Migrar scheduleEntries: yearLevel → yearId
        const parsed = JSON.parse(savedScheduleEntries) as any[];
        const migrated = parsed.map((e) => ({
          ...e,
          yearId: e.yearId || e.yearLevel, // Mantener compatibilidad tem poral
        }));
        setScheduleEntries(migrated);
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }, []);

  // Guardar profesores al cambiar
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("teachers", JSON.stringify(teachers));
    }
  }, [teachers, isMounted]);

  // Guardar materias al cambiar
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("subjects", JSON.stringify(subjects));
    }
  }, [subjects, isMounted]);

  // Guardar horarios al cambiar
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("scheduleEntries", JSON.stringify(scheduleEntries));
    }
  }, [scheduleEntries, isMounted]);

  // Guardar años al cambiar
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("years", JSON.stringify(years));
    }
  }, [years, isMounted]);

  // Guardar asignaciones de materias por año
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("yearSubjects", JSON.stringify(yearSubjects));
    }
  }, [yearSubjects, isMounted]);

  // Agregar profesor
  const addTeacher = () => {
    if (teacherName.trim() && teacherLastName.trim() && teacherAvailableDays.length > 0) {
      setTeachers([
        ...teachers,
        { 
          id: Date.now().toString(), 
          name: teacherName,
          lastName: teacherLastName,
          availableDays: teacherAvailableDays
        },
      ]);
      setTeacherName("");
      setTeacherLastName("");
      setTeacherAvailableDays([0, 1, 2, 3, 4]); // Reset a todos disponibles
    } else {
      alert("Completa todos los campos y selecciona al menos un día disponible");
    }
  };

  // Agregar materia
  const addSubject = () => {
    if (subjectName.trim() && selectedTeacherForSubject) {
      setSubjects([
        ...subjects,
        { 
          id: Date.now().toString(), 
          name: subjectName,
          teacherId: selectedTeacherForSubject,
        },
      ]);
      setSubjectName("");
      setSelectedTeacherForSubject("");
    } else {
      alert("Debes completar el nombre de la materia y seleccionar un profesor");
    }
  };

  // Agregar año
  const addYear = () => {
    const level = parseInt(newYearLevel);
    if (level > 0 && !years.find((y) => y.level === level)) {
      setYears([
        ...years,
        {
          id: Date.now().toString(),
          level,
        },
      ]);
      setNewYearLevel("");
    } else {
      alert("Ingresa un nivel válido y no duplicado");
    }
  };

  // Agregar materia a un año con horas específicas
  const addSubjectToYear = () => {
    const hours = parseInt(selectedSubjectHours);
    if (selectedYearForSubjects && selectedSubjectForYear && hours > 0) {
      // Verificar que no exista ya
      if (!yearSubjects.find((ys) => ys.yearId === selectedYearForSubjects && ys.subjectId === selectedSubjectForYear)) {
        setYearSubjects([
          ...yearSubjects,
          {
            id: Date.now().toString(),
            yearId: selectedYearForSubjects,
            subjectId: selectedSubjectForYear,
            hoursRequired: hours,
          },
        ]);
        setSelectedSubjectForYear("");
        setSelectedSubjectHours("");
      } else {
        alert("Esta materia ya está asignada a este año");
      }
    } else {
      alert("Debes seleccionar una materia, año y especificar las horas");
    }
  };

  // Eliminar profesor
  const deleteTeacher = (id: string) => {
    setTeachers(teachers.filter((t) => t.id !== id));
    setScheduleEntries(scheduleEntries.filter((e) => e.teacherId !== id));
  };

  // Iniciar edición de días disponibles
  const startEditingTeacher = (id: string) => {
    const teacher = teachers.find((t) => t.id === id);
    if (teacher) {
      setEditingTeacherId(id);
      setTempAvailableDays([...teacher.availableDays]);
    }
  };

  // Guardar cambios de días disponibles
  const saveTeacherDays = () => {
    if (editingTeacherId) {
      setTeachers(
        teachers.map((t) =>
          t.id === editingTeacherId ? { ...t, availableDays: tempAvailableDays } : t
        )
      );
      setEditingTeacherId(null);
      setTempAvailableDays([]);
    }
  };

  // Cancelar edición
  const cancelEditingTeacher = () => {
    setEditingTeacherId(null);
    setTempAvailableDays([]);
  };

  // Eliminar materia
  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
    setYearSubjects(yearSubjects.filter((ys) => ys.subjectId !== id));
    setScheduleEntries(scheduleEntries.filter((e) => e.subjectId !== id));
  };

  // Eliminar año
  const deleteYear = (id: string) => {
    setYears(years.filter((y) => y.id !== id));
    setYearSubjects(yearSubjects.filter((ys) => ys.yearId !== id));
    setScheduleEntries(scheduleEntries.filter((e) => e.yearId !== id));
  };

  // Eliminar asignación de materia a año
  const deleteYearSubject = (id: string) => {
    setYearSubjects(yearSubjects.filter((ys) => ys.id !== id));
    setScheduleEntries(scheduleEntries.filter((e) => {
      const ys = yearSubjects.find(y => y.id === id);
      return !(e.yearId === ys?.yearId && e.subjectId === ys?.subjectId);
    }));
  };

  // Contar horas asignadas de una materia en un año
  const getSubjectHoursInYear = (subjectId: string, yearId: string): number => {
    return scheduleEntries.filter((e) => e.subjectId === subjectId && e.yearId === yearId).length;
  };

  // Validar si una materia puede recibir más horas en un año
  const canSubjectReceiveMoreHours = (subjectId: string, yearId: string): boolean => {
    const yearSubject = yearSubjects.find((ys) => ys.yearId === yearId && ys.subjectId === subjectId);
    if (!yearSubject) return false;
    const currentHours = getSubjectHoursInYear(subjectId, yearId);
    return currentHours < yearSubject.hoursRequired;
  };

  // Validar si un profesor está disponible en un horario y día
  const isTeacherAvailable = (
    teacherId: string,
    timeSlotId: string,
    dayIndex: number,
    yearId: string
  ): boolean => {
    const teacher = teachers.find((t) => t.id === teacherId);
    
    // Verificar si el profesor tiene disponibilidad ese día
    const availableDays = teacher?.availableDays || [0, 1, 2, 3, 4];
    if (!teacher || !availableDays.includes(dayIndex)) {
      return false;
    }

    // Verificar que no esté en otro año al mismo tiempo
    return !scheduleEntries.some(
      (entry) =>
        entry.teacherId === teacherId &&
        entry.timeSlotId === timeSlotId &&
        entry.dayIndex === dayIndex &&
        entry.yearId !== yearId
    );
  };

  // Agregar entrada de horario
  const addScheduleEntry = (
    timeSlotId: string,
    dayIndex: number,
    yearId: string,
    teacherId: string,
    subjectId: string
  ) => {
    if (!teacherId || !subjectId) return;

    if (!isTeacherAvailable(teacherId, timeSlotId, dayIndex, yearId)) {
      alert(
        "Este profesor ya está asignado en otro año a este horario y día."
      );
      return;
    }

    // Validar que la materia no supere sus horas en este año
    if (!canSubjectReceiveMoreHours(subjectId, yearId)) {
      const yearSubject = yearSubjects.find((ys) => ys.yearId === yearId && ys.subjectId === subjectId);
      alert(
        `La materia ya alcanzó sus ${yearSubject?.hoursRequired} horas requeridas para este año`
      );
      return;
    }

    // Eliminar entrada anterior en este horario/día/año si existe
    setScheduleEntries((entries) =>
      entries.filter((e) => !(e.timeSlotId === timeSlotId && e.dayIndex === dayIndex && e.yearId === yearId))
    );

    // Agregar nueva entrada
    setScheduleEntries((entries) => [
      ...entries,
      {
        id: Date.now().toString(),
        timeSlotId,
        dayIndex,
        teacherId,
        subjectId,
        yearId,
      },
    ]);
  };

  // Obtener entrada de horario
  const getScheduleEntry = (
    timeSlotId: string,
    dayIndex: number,
    yearId: string
  ): ScheduleEntry | undefined => {
    return scheduleEntries.find(
      (e) => e.timeSlotId === timeSlotId && e.dayIndex === dayIndex && e.yearId === yearId
    );
  };

  // Eliminar entrada de horario
  const deleteScheduleEntry = (entryId: string) => {
    setScheduleEntries(
      scheduleEntries.filter((e) => e.id !== entryId)
    );
  };

  const getTeacherName = (id: string) => {
    const teacher = teachers.find((t) => t.id === id);
    return teacher ? `${teacher.name} ${teacher.lastName}` : "N/A";
  };
  const getSubjectName = (id: string) =>
    subjects.find((s) => s.id === id)?.name || "N/A";
  const getTeacherSubjects = (teacherId: string) =>
    subjects.filter((s) => s.teacherId === teacherId);
  const getSubjectsForYear = (yearId: string) =>
    yearSubjects.filter((ys) => ys.yearId === yearId);
  const getYearLevel = (yearId: string) =>
    years.find((y) => y.id === yearId)?.level || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-8">
      {!isMounted ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      ) : (
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            📅 Gestor de Horarios Escolares
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView("teachers")}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                view === "teachers"
                  ? "bg-orange-600 text-white"
                  : "bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600"
              }`}
            >
              👨‍🏫 Profesores
            </button>
            <button
              onClick={() => setView("admin")}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                view === "admin"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600"
              }`}
            >
              📚 Materias
            </button>
            <button
              onClick={() => setView("years")}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                view === "years"
                  ? "bg-green-600 text-white"
                  : "bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600"
              }`}
            >
              📖 Años
            </button>
            <button
              onClick={() => setView("schedule")}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                view === "schedule"
                  ? "bg-purple-600 text-white"
                  : "bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600"
              }`}
            >
              🗓️ Horarios
            </button>
          </div>
        </div>

        {/* Vista de Profesores */}
        {view === "teachers" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
              👨‍🏫 Gestión de Profesores
            </h2>

            <div className="space-y-4 mb-8 max-w-3xl bg-orange-50 dark:bg-slate-700 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  placeholder="Apellido"
                  value={teacherLastName}
                  onChange={(e) => setTeacherLastName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTeacher()}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Días disponibles:
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {DAYS.map((day, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={teacherAvailableDays.includes(idx)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTeacherAvailableDays([...teacherAvailableDays, idx].sort());
                          } else {
                            setTeacherAvailableDays(teacherAvailableDays.filter((d) => d !== idx));
                          }
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={addTeacher}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Agregar Profesor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-orange-50 dark:bg-slate-700 p-4 rounded-lg border border-orange-200 dark:border-orange-800"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {teacher.name} {teacher.lastName}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Disponible: {(teacher.availableDays || [0, 1, 2, 3, 4]).map((d) => DAYS[d]).join(", ")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditingTeacher(teacher.id)}
                        className="text-blue-500 hover:text-blue-700 text-lg font-bold"
                        title="Editar días disponibles"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteTeacher(teacher.id)}
                        className="text-red-500 hover:text-red-700 text-xl font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>
                      <span className="font-semibold">Materias:</span> {getTeacherSubjects(teacher.id).length}
                    </p>
                    <p>
                      <span className="font-semibold">En horarios:</span> {scheduleEntries.filter((e) => e.teacherId === teacher.id).length}
                    </p>
                  </div>
                </div>
              ))}
              {teachers.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-12 col-span-full">
                  Sin profesores aún. Crea el primero para empezar.
                </p>
              )}
            </div>

            {editingTeacherId && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 max-w-md w-full">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                    Editar Disponibilidad
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {teachers.find((t) => t.id === editingTeacherId)?.name} {teachers.find((t) => t.id === editingTeacherId)?.lastName}
                  </p>

                  <div className="space-y-3 mb-6">
                    {DAYS.map((day, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-3 cursor-pointer hover:bg-orange-50 dark:hover:bg-slate-700 p-2 rounded transition"
                      >
                        <input
                          type="checkbox"
                          checked={tempAvailableDays.includes(idx)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTempAvailableDays([...tempAvailableDays, idx].sort((a, b) => a - b));
                            } else {
                              setTempAvailableDays(tempAvailableDays.filter((d) => d !== idx));
                            }
                          }}
                          className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500 cursor-pointer"
                        />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{day}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={saveTeacherDays}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancelEditingTeacher}
                      className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vista de Administración (Materias) */}
        {view === "admin" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
              📚 Gestión de Materias
            </h2>

            <div className="space-y-3 mb-6 max-w-4xl">
              <input
                type="text"
                placeholder="Nombre de la materia"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && teachers.length > 0 && addSubject()}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {teachers.length > 0 && (
                <select
                  value={selectedTeacherForSubject}
                  onChange={(e) => setSelectedTeacherForSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar profesor responsable</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} {teacher.lastName}
                    </option>
                  ))}
                </select>
              )}
              
              <button
                onClick={addSubject}
                disabled={teachers.length === 0}
                className={`w-full font-semibold py-2 px-4 rounded-lg transition duration-200 ${
                  teachers.length === 0
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                Agregar Materia
              </button>
              {teachers.length === 0 && (
                <p className="text-sm text-orange-600 dark:text-orange-400 font-semibold">
                  ⚠️ Primero crea profesores en la pestaña "Profesores"
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-green-50 dark:bg-slate-700 p-4 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {subject.name}
                    </h3>
                    <button
                      onClick={() => deleteSubject(subject.id)}
                      className="text-red-500 hover:text-red-700 text-xl font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>
                      <span className="font-semibold">Profesor:</span> {getTeacherName(subject.teacherId)}
                    </p>
                  </div>
                </div>
              ))}
              {subjects.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-12 col-span-full">
                  Sin materias aún. Crea la primera materia.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Vista de Años */}
        {view === "years" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
                📖 Gestión de Años
              </h2>

              <div className="space-y-3 mb-6 max-w-2xl">
                <input
                  type="number"
                  placeholder="Nivel del año (ej: 1, 2, 3...)"
                  value={newYearLevel}
                  onChange={(e) => setNewYearLevel(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addYear()}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={addYear}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Crear Año
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {years.map((year) => (
                  <div
                    key={year.id}
                    className="bg-green-50 dark:bg-slate-700 p-4 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Año {year.level}°
                      </h3>
                      <button
                        onClick={() => deleteYear(year.id)}
                        className="text-red-500 hover:text-red-700 text-xl font-bold"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>
                        <span className="font-semibold">Materias:</span> {getSubjectsForYear(year.id).length}
                      </p>
                      <p>
                        <span className="font-semibold">Horas totales:</span>{" "}
                        {getSubjectsForYear(year.id).reduce((sum, ys) => sum + ys.hoursRequired, 0)}
                      </p>
                    </div>
                  </div>
                ))}
                {years.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-12 col-span-full">
                    Sin años aún. Crea el primer año.
                  </p>
                )}
              </div>
            </div>

            {years.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
                  📚 Asignar Materias a Años
                </h2>

                <div className="space-y-3 mb-6 max-w-2xl">
                  <select
                    value={selectedYearForSubjects}
                    onChange={(e) => {
                      setSelectedYearForSubjects(e.target.value);
                      setSelectedSubjectForYear("");
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar año</option>
                    {years.map((year) => (
                      <option key={year.id} value={year.id}>
                        Año {year.level}°
                      </option>
                    ))}
                  </select>

                  {selectedYearForSubjects && (
                    <>
                      <select
                        value={selectedSubjectForYear}
                        onChange={(e) => setSelectedSubjectForYear(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar materia</option>
                        {subjects.map((subject) => {
                          const alreadyAssigned = yearSubjects.some(
                            (ys) => ys.yearId === selectedYearForSubjects && ys.subjectId === subject.id
                          );
                          return (
                            <option key={subject.id} value={subject.id} disabled={alreadyAssigned}>
                              {subject.name}
                              {alreadyAssigned ? " (ya asignada)" : ""}
                            </option>
                          );
                        })}
                      </select>

                      <input
                        type="number"
                        placeholder="Horas requeridas"
                        value={selectedSubjectHours}
                        onChange={(e) => setSelectedSubjectHours(e.target.value)}
                        min="1"
                        max="40"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <button
                        onClick={addSubjectToYear}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                      >
                        Asignar Materia
                      </button>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {years.map((year) => (
                    <div key={year.id} className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                        Año {year.level}°
                      </h3>
                      <div className="space-y-2">
                        {getSubjectsForYear(year.id).map((ys) => (
                          <div
                            key={ys.id}
                            className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border border-gray-200 dark:border-slate-600"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                {getSubjectName(ys.subjectId)}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {ys.hoursRequired} horas
                              </p>
                            </div>
                            <button
                              onClick={() => deleteYearSubject(ys.id)}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {getSubjectsForYear(year.id).length === 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                            Sin materias asignadas
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vista de Horarios */}
        {view === "schedule" && (
          <div>
            {years.length === 0 || subjects.length === 0 || yearSubjects.length === 0 ? (
              <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center">
                <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                  ⚠️ Debes crear años y asignar materias a los años antes de crear horarios
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {years.map((year) => (
                  <div
                    key={year.id}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 overflow-x-auto"
                  >
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                      📖 Año {year.level}°
                    </h2>

                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 px-3 py-2 text-gray-700 dark:text-gray-300 font-semibold text-left">
                            Horario
                          </th>
                          {DAYS.map((day, idx) => (
                            <th
                              key={idx}
                              className="border border-gray-300 dark:border-slate-600 bg-blue-100 dark:bg-blue-900 px-3 py-2 text-blue-900 dark:text-blue-100 font-semibold text-center"
                            >
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {TIME_SLOTS.map((slot) => (
                          <tr key={slot.id}>
                            <td className="border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-3 py-2 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                              {slot.startTime}
                              <br />
                              {slot.endTime}
                            </td>
                            {DAYS.map((_, dayIndex) => {
                              const entry = getScheduleEntry(slot.id, dayIndex, year.id);
                              const isAssigned = !!entry;

                              return (
                                <td
                                  key={`${slot.id}-${dayIndex}`}
                                  className="border border-gray-300 dark:border-slate-600 p-2 h-24 align-top"
                                >
                                  {isAssigned ? (
                                    <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 p-2 rounded border border-blue-200 dark:border-blue-700 h-full flex flex-col">
                                      <div className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">
                                        {getTeacherName(entry.teacherId)}
                                      </div>
                                      <div className="text-xs text-green-800 dark:text-green-200 flex-1">
                                        {getSubjectName(entry.subjectId)}
                                      </div>
                                      <button
                                        onClick={() => deleteScheduleEntry(entry.id)}
                                        className="text-red-500 hover:text-red-700 text-xs font-bold mt-1 self-end"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-1 h-full flex flex-col">
                                      <select
                                        data-teacher-select={`${year.id}-${slot.id}-${dayIndex}`}
                                        onChange={(e) => {
                                          const teacherId = e.target.value;
                                          const subjectSelect = document.querySelector(
                                            `[data-subject-select="${year.id}-${slot.id}-${dayIndex}"]`
                                          ) as HTMLSelectElement;
                                          if (subjectSelect) {
                                            subjectSelect.innerHTML = '<option value="">Materia</option>';
                                            if (teacherId) {
                                              // Mostrar solo materias asignadas a este año
                                              const yearSubjectsForTeacher = getSubjectsForYear(year.id).filter(
                                                (ys) => {
                                                  const subj = subjects.find((s) => s.id === ys.subjectId);
                                                  return subj?.teacherId === teacherId;
                                                }
                                              );
                                              yearSubjectsForTeacher.forEach((ys) => {
                                                const option = document.createElement('option');
                                                option.value = ys.subjectId;
                                                option.textContent = getSubjectName(ys.subjectId);
                                                subjectSelect.appendChild(option);
                                              });
                                            }
                                          }
                                        }}
                                        className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-xs dark:bg-slate-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      >
                                        <option value="">Profesor</option>
                                        {teachers.map((teacher) => {
                                          const canAssign = isTeacherAvailable(
                                            teacher.id,
                                            slot.id,
                                            dayIndex,
                                            year.id
                                          );
                                          return (
                                            <option
                                              key={teacher.id}
                                              value={teacher.id}
                                              disabled={!canAssign}
                                            >
                                              {teacher.name}
                                              {!canAssign ? " (No disp.)" : ""}
                                            </option>
                                          );
                                        })}
                                      </select>
                                      <select
                                        data-subject-select={`${year.id}-${slot.id}-${dayIndex}`}
                                        onChange={(e) => {
                                          const subjectId = e.target.value;
                                          const teacherSelect = document.querySelector(
                                            `[data-teacher-select="${year.id}-${slot.id}-${dayIndex}"]`
                                          ) as HTMLSelectElement;
                                          if (teacherSelect && teacherSelect.value && subjectId) {
                                            addScheduleEntry(
                                              slot.id,
                                              dayIndex,
                                              year.id,
                                              teacherSelect.value,
                                              subjectId
                                            );
                                          }
                                        }}
                                        className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-xs dark:bg-slate-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                                      >
                                        <option value="">Materia</option>
                                      </select>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reporte de cumplimiento de horas en vista schedule */}
        {view === "schedule" && yearSubjects.length > 0 && (
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              📋 Cumplimiento de Horas por Materia y Año
            </h2>

            <div className="space-y-4">
              {years.map((year) => {
                const yearSubs = getSubjectsForYear(year.id);
                return yearSubs.length > 0 ? (
                  <div key={year.id} className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                      Año {year.level}°
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {yearSubs.map((ys) => {
                        const assignedHours = getSubjectHoursInYear(ys.subjectId, year.id);
                        const requiredHours = ys.hoursRequired;
                        const isComplete = assignedHours >= requiredHours;
                        const percentage = Math.min((assignedHours / requiredHours) * 100, 100);

                        return (
                          <div
                            key={`${ys.id}`}
                            className={`p-3 rounded-lg border-2 ${
                              isComplete
                                ? "bg-green-100 dark:bg-green-900 border-green-500 dark:border-green-600"
                                : "bg-yellow-100 dark:bg-yellow-900 border-yellow-500 dark:border-yellow-600"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-semibold text-gray-800 dark:text-white">
                                {getSubjectName(ys.subjectId)}
                              </p>
                              <p className={`text-sm font-bold ${
                                isComplete
                                  ? "text-green-600 dark:text-green-300"
                                  : "text-yellow-600 dark:text-yellow-300"
                              }`}>
                                {assignedHours}/{requiredHours}h
                              </p>
                            </div>
                            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isComplete
                                    ? "bg-green-600 dark:bg-green-500"
                                    : "bg-yellow-600 dark:bg-yellow-500"
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {isComplete ? "✅ Completado" : `${requiredHours - assignedHours} horas faltantes`}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Resumen en vista admin, teachers y years */}
        {(view === "admin" || view === "teachers" || view === "years") && (
          <div className="mt-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              📊 Resumen
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-100 dark:bg-orange-900 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-300">
                  {teachers.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Profesores
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-300">
                  {subjects.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Materias
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {years.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Años
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                  {scheduleEntries.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Asignaciones
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
