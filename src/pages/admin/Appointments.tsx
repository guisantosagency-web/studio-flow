import { useEffect, useState } from 'react';
import { Calendar, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { MobileNav } from '@/components/admin/MobileNav';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  data: string;
  hora: string;
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
  anamnese_json: any;
  criado_em: string;
  profiles: { nome: string; whatsapp: string } | null;
  services: { nome: string; valor: number } | null;
}

const statusConfig = {
  pendente: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-600', icon: Clock },
  confirmado: { label: 'Confirmado', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  concluido: { label: 'Concluído', color: 'bg-blue-500/10 text-blue-600', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'bg-rose/10 text-rose', icon: XCircle },
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        profiles (nome, whatsapp),
        services (nome, valor)
      `)
      .order('data', { ascending: false })
      .order('hora', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar agendamentos');
      return;
    }

    setAppointments(data || []);
    setIsLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar status');
      return;
    }

    toast.success('Status atualizado!');
    fetchAppointments();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Agendamentos</h1>
              <p className="text-muted-foreground">Gerencie todos os agendamentos</p>
            </div>
          </div>
          
          <div className="neu-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => {
                    const config = statusConfig[appointment.status];
                    const StatusIcon = config.icon;
                    
                    return (
                      <TableRow key={appointment.id} className="border-border/50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{appointment.profiles?.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.profiles?.whatsapp}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{appointment.services?.nome}</TableCell>
                        <TableCell>{formatDate(appointment.data)}</TableCell>
                        <TableCell>{appointment.hora}</TableCell>
                        <TableCell>
                          <Select
                            value={appointment.status}
                            onValueChange={(value) => updateStatus(appointment.id, value)}
                          >
                            <SelectTrigger className={cn("w-36 border-0", config.color)}>
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  <StatusIcon className="w-4 h-4" />
                                  {config.label}
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="confirmado">Confirmado</SelectItem>
                              <SelectItem value="concluido">Concluído</SelectItem>
                              <SelectItem value="cancelado">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {appointments.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <MobileNav />
      
      {/* Appointment Details Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="neu-card border-0 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Detalhes do Agendamento</DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedAppointment.profiles?.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{selectedAppointment.profiles?.whatsapp}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Serviço</p>
                  <p className="font-medium">{selectedAppointment.services?.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-medium">R$ {selectedAppointment.services?.valor?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">{formatDate(selectedAppointment.data)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium">{selectedAppointment.hora}</p>
                </div>
              </div>
              
              {selectedAppointment.anamnese_json && (
                <div className="pt-4 border-t border-border">
                  <h4 className="font-semibold mb-3">Respostas da Anamnese</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedAppointment.anamnese_json).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium">
                          {typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
