import { useEffect, useState } from 'react';
import { Plus, Trash2, Clock, Calendar, Copy } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { MobileNav } from '@/components/admin/MobileNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AvailableTime {
  id: string;
  data: string;
  hora: string;
  ativo: boolean;
}

const weekDays = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

export default function Schedules() {
  const [times, setTimes] = useState<AvailableTime[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [bulkConfig, setBulkConfig] = useState({
    startDate: '',
    endDate: '',
    times: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    selectedDays: [1, 2, 3, 4, 5],
  });

  useEffect(() => {
    fetchTimes();
  }, []);

  const fetchTimes = async () => {
    const { data, error } = await supabase
      .from('available_times')
      .select('*')
      .eq('ativo', true)
      .gte('data', format(new Date(), 'yyyy-MM-dd'))
      .order('data')
      .order('hora');

    if (error) {
      toast.error('Erro ao carregar horários');
      return;
    }

    setTimes(data || []);
  };

  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('available_times')
      .insert([{ data: newDate, hora: newTime }]);

    if (error) {
      if (error.code === '23505') {
        toast.error('Este horário já existe');
      } else {
        toast.error('Erro ao adicionar horário');
      }
      return;
    }

    toast.success('Horário adicionado!');
    setIsModalOpen(false);
    setNewDate('');
    setNewTime('');
    fetchTimes();
  };

  const handleBulkAdd = async () => {
    if (!bulkConfig.startDate || !bulkConfig.endDate) {
      toast.error('Selecione as datas de início e fim');
      return;
    }

    const slots: { data: string; hora: string }[] = [];
    let currentDate = parseISO(bulkConfig.startDate);
    const endDate = parseISO(bulkConfig.endDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (bulkConfig.selectedDays.includes(dayOfWeek)) {
        for (const time of bulkConfig.times) {
          slots.push({
            data: format(currentDate, 'yyyy-MM-dd'),
            hora: time,
          });
        }
      }
      currentDate = addDays(currentDate, 1);
    }

    if (slots.length === 0) {
      toast.error('Nenhum horário para criar com essa configuração');
      return;
    }

    const { error } = await supabase
      .from('available_times')
      .upsert(slots, { onConflict: 'data,hora' });

    if (error) {
      toast.error('Erro ao criar horários');
      return;
    }

    toast.success(`${slots.length} horários criados!`);
    setIsBulkModalOpen(false);
    fetchTimes();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('available_times')
      .update({ ativo: false })
      .eq('id', id);

    if (error) {
      toast.error('Erro ao remover horário');
      return;
    }

    toast.success('Horário removido!');
    fetchTimes();
  };

  const addTimeSlot = () => {
    const newTimeSlot = prompt('Digite o horário (HH:MM):');
    if (newTimeSlot && /^\d{2}:\d{2}$/.test(newTimeSlot)) {
      setBulkConfig({
        ...bulkConfig,
        times: [...bulkConfig.times, newTimeSlot].sort(),
      });
    }
  };

  const removeTimeSlot = (time: string) => {
    setBulkConfig({
      ...bulkConfig,
      times: bulkConfig.times.filter((t) => t !== time),
    });
  };

  // Group times by date
  const groupedTimes = times.reduce((acc, time) => {
    if (!acc[time.data]) {
      acc[time.data] = [];
    }
    acc[time.data].push(time);
    return acc;
  }, {} as Record<string, AvailableTime[]>);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Horários</h1>
              <p className="text-muted-foreground">Gerencie a disponibilidade</p>
            </div>
            
            <div className="flex gap-3">
              <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Criar em Lote
                  </Button>
                </DialogTrigger>
                <DialogContent className="neu-card border-0 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Criar Horários em Lote</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Data Início</label>
                        <Input
                          type="date"
                          value={bulkConfig.startDate}
                          onChange={(e) => setBulkConfig({ ...bulkConfig, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Data Fim</label>
                        <Input
                          type="date"
                          value={bulkConfig.endDate}
                          onChange={(e) => setBulkConfig({ ...bulkConfig, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Dias da Semana</label>
                      <div className="flex flex-wrap gap-2">
                        {weekDays.map((day) => (
                          <label
                            key={day.value}
                            className={`px-4 py-2 rounded-xl cursor-pointer transition-all ${
                              bulkConfig.selectedDays.includes(day.value)
                                ? 'bg-primary text-white'
                                : 'bg-secondary text-foreground'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={bulkConfig.selectedDays.includes(day.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setBulkConfig({
                                    ...bulkConfig,
                                    selectedDays: [...bulkConfig.selectedDays, day.value],
                                  });
                                } else {
                                  setBulkConfig({
                                    ...bulkConfig,
                                    selectedDays: bulkConfig.selectedDays.filter((d) => d !== day.value),
                                  });
                                }
                              }}
                            />
                            {day.label}
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Horários</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {bulkConfig.times.map((time) => (
                          <span
                            key={time}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-lg flex items-center gap-2"
                          >
                            {time}
                            <button
                              onClick={() => removeTimeSlot(time)}
                              className="text-rose hover:text-rose-dark"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" onClick={addTimeSlot}>
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    
                    <Button variant="gradient" className="w-full" onClick={handleBulkAdd}>
                      Criar Horários
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="gradient">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Horário
                  </Button>
                </DialogTrigger>
                <DialogContent className="neu-card border-0 max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Novo Horário</DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleAddSingle} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Data</label>
                      <Input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Horário</label>
                      <Input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" variant="gradient" className="w-full">
                      Adicionar
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Times Grid */}
          <div className="space-y-6">
            {Object.entries(groupedTimes).map(([date, dayTimes]) => (
              <div key={date} className="neu-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground">{dayTimes.length} horários</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {dayTimes.map((time) => (
                    <div
                      key={time.id}
                      className="group flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl"
                    >
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{time.hora}</span>
                      <button
                        onClick={() => handleDelete(time.id)}
                        className="text-rose opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {times.length === 0 && (
            <div className="neu-card text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum horário disponível</p>
              <p className="text-sm text-muted-foreground mt-1">
                Crie horários para suas clientes agendarem
              </p>
            </div>
          )}
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}
