import { useEffect, useState } from 'react';
import { Users, Phone, Calendar, Search } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { MobileNav } from '@/components/admin/MobileNav';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Client {
  id: string;
  nome: string;
  sobrenome: string | null;
  whatsapp: string;
  criado_em: string;
  appointmentCount?: number;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar clientes');
      return;
    }

    // Get appointment counts for each client
    const clientsWithCounts = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { count } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.user_id);

        return {
          ...profile,
          appointmentCount: count || 0,
        };
      })
    );

    setClients(clientsWithCounts);
    setIsLoading(false);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.nome.toLowerCase().includes(search.toLowerCase()) ||
      client.whatsapp.includes(search)
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatWhatsApp = (whatsapp: string) => {
    return whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Clientes</h1>
              <p className="text-muted-foreground">{clients.length} clientes cadastrados</p>
            </div>
            
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou WhatsApp..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="neu-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Cliente</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Agendamentos</TableHead>
                    <TableHead>Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} className="border-border/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-rose flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {client.nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{client.nome}</p>
                            {client.sobrenome && (
                              <p className="text-sm text-muted-foreground">{client.sobrenome}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {formatWhatsApp(client.whatsapp)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {client.appointmentCount}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(client.criado_em)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredClients.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}
