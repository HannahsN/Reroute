import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Trash2, GripVertical, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PRIORITY_STYLES = {
  high: { dot: "bg-rose-400", text: "text-rose-400", label: "High" },
  medium: { dot: "bg-amber-400", text: "text-amber-400", label: "Med" },
  low: { dot: "bg-slate-500", text: "text-slate-500", label: "Low" },
};

export default function TodayFocus() {
  const today = format(new Date(), "yyyy-MM-dd");
  const qc = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newMinutes, setNewMinutes] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [adding, setAdding] = useState(false);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", today],
    queryFn: () => base44.entities.Task.filter({ date: today }, "sort_order", 50),
  });

  const sorted = [...tasks].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const createTask = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks", today] }); setAdding(false); setNewTitle(""); setNewMinutes(""); setNewSubject(""); },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", today] }),
  });

  const deleteTask = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", today] }),
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(sorted);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    reordered.forEach((task, i) => {
      if (task.sort_order !== i) updateTask.mutate({ id: task.id, data: { sort_order: i } });
    });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createTask.mutate({
      title: newTitle.trim(),
      subject: newSubject,
      priority: newPriority,
      estimated_minutes: newMinutes ? Number(newMinutes) : null,
      completed: false,
      sort_order: sorted.length,
      date: today,
    });
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Today's Focus</h2>
          <p className="text-slate-500 text-xs mt-0.5">{completedCount}/{tasks.length} complete</p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg bg-blue-400/10 hover:bg-blue-400/15"
        >
          <Plus className="w-3.5 h-3.5" /> Add task
        </button>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
          />
        </div>
      )}

      {/* Add task form */}
      {adding && (
        <form onSubmit={handleAdd} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 space-y-3">
          <Input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Task title…"
            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 h-9 text-sm"
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              placeholder="Subject"
              className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 h-9 text-xs"
            />
            <Select value={newPriority} onValueChange={setNewPriority}>
              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={newMinutes}
              onChange={e => setNewMinutes(e.target.value)}
              placeholder="Est. min"
              className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 h-9 text-xs"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">Save</button>
            <button type="button" onClick={() => setAdding(false)} className="px-4 h-8 text-xs text-slate-400 hover:text-white rounded-lg bg-slate-700/50 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {/* Task list */}
      {sorted.length === 0 && !adding ? (
        <p className="text-center text-slate-600 text-sm py-6">No tasks yet — add your first one</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {sorted.map((task, index) => {
                  const pStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
                  return (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(drag, snapshot) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
                            snapshot.isDragging
                              ? "bg-slate-700/80 border-slate-500/50 shadow-xl"
                              : "bg-slate-800/40 border-slate-700/30 hover:border-slate-600/40",
                            task.completed && "opacity-50"
                          )}
                        >
                          <div {...drag.dragHandleProps} className="text-slate-600 hover:text-slate-400 cursor-grab">
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>
                          <button
                            onClick={() => updateTask.mutate({ id: task.id, data: { completed: !task.completed } })}
                            className={cn(
                              "w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all",
                              task.completed ? "bg-teal-500 border-teal-500" : "border-slate-600 hover:border-slate-400"
                            )}
                          >
                            {task.completed && <Check className="w-2.5 h-2.5 text-white" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-medium truncate", task.completed ? "line-through text-slate-500" : "text-white")}>
                              {task.title}
                            </p>
                            {(task.subject || task.estimated_minutes) && (
                              <div className="flex items-center gap-2 mt-0.5">
                                {task.subject && <span className="text-[10px] text-slate-500">{task.subject}</span>}
                                {task.estimated_minutes && (
                                  <span className="text-[10px] text-slate-600 flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" />{task.estimated_minutes}m
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className={cn("text-[10px] font-medium flex-shrink-0", pStyle.text)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full inline-block mr-1", pStyle.dot)} />
                            {pStyle.label}
                          </div>
                          <button
                            onClick={() => deleteTask.mutate(task.id)}
                            className="text-slate-700 hover:text-rose-400 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}