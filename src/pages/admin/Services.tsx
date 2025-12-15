import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Scissors } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { MobileNav } from '@/components/admin/MobileNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  nome: string;
  descricao: string | null;
  duracao: number;
  valor: number | null;
  exibir_valor: boolean;
  requer_anamnese: boolean;
  ativo: boolean;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao: 60,
    valor: '',
    exibir_valor: true,
    requer_anamnese: false,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('nome');

    if (error) {
      toast.error('Erro ao carregar serviços');
      return;
    }

    setServices(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const serviceData = {
      nome: formData.nome,
      descricao: formData.descricao || null,
      duracao: formData.duracao,
      valor: formData.valor ? parseFloat(formData.valor) : null,
      exibir_valor: formData.exibir_valor,
      requer_anamnese: formData.requer_anamnese,
    };

    if (editingService) {
      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', editingService.id);

      if (error) {
        toast.error('Erro ao atualizar serviço');
        return;
      }
      toast.success('Serviço atualizado!');
    } else {
      const { error } = await supabase
        .from('services')
        .insert([serviceData]);

      if (error) {
        toast.error('Erro ao criar serviço');
        return;
      }
      toast.success('Serviço criado!');
    }

    setIsModalOpen(false);
    resetForm();
    fetchServices();
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      nome: service.nome,
      descricao: service.descricao || '',
      duracao: service.duracao,
      valor: service.valor?.toString() || '',
      exibir_valor: service.exibir_valor,
      requer_anamnese: service.requer_anamnese,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

    const { error } = await supabase
      .from('services')
      .update({ ativo: false })
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir serviço');
      return;
    }

    toast.success('Serviço excluído!');
    fetchServices();
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      nome: '',
      descricao: '',
      duracao: 60,
      valor: '',
      exibir_valor: true,
      requer_anamnese: false,
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Serviços</h1>
              <p className="text-muted-foreground">Gerencie os serviços oferecidos</p>
            </div>
            
            <Dialog open={isModalOpen} onOpenChange={(open) => {
              setIsModalOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Serviço
                </Button>
              </DialogTrigger>
              <DialogContent className="neu-card border-0 max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl">
                    {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <Input
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Design de Sobrancelhas"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descrição do serviço"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Duração (min)</label>
                      <Input
                        type="number"
                        value={formData.duracao}
                        onChange={(e) => setFormData({ ...formData, duracao: parseInt(e.target.value) })}
                        min={15}
                        step={15}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Valor (R$)</label>
                      <Input
                        type="number"
                        value={formData.valor}
                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <label className="text-sm font-medium">Exibir valor para cliente</label>
                    <Switch
                      checked={formData.exibir_valor}
                      onCheckedChange={(checked) => setFormData({ ...formData, exibir_valor: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <label className="text-sm font-medium">Requer anamnese</label>
                    <Switch
                      checked={formData.requer_anamnese}
                      onCheckedChange={(checked) => setFormData({ ...formData, requer_anamnese: checked })}
                    />
                  </div>
                  
                  <Button type="submit" variant="gradient" className="w-full">
                    {editingService ? 'Salvar Alterações' : 'Criar Serviço'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.filter(s => s.ativo).map((service) => (
              <div key={service.id} className="neu-card group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Scissors className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)}>
                      <Trash2 className="w-4 h-4 text-rose" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">{service.nome}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {service.descricao || 'Sem descrição'}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">{service.duracao} min</span>
                  {service.exibir_valor && service.valor && (
                    <span className="text-lg font-bold text-gradient-primary">
                      R$ {service.valor.toFixed(2)}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  {service.requer_anamnese && (
                    <span className="text-xs bg-rose/10 text-rose px-2 py-1 rounded-lg">
                      Anamnese
                    </span>
                  )}
                  {!service.exibir_valor && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-lg">
                      Valor oculto
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {services.filter(s => s.ativo).length === 0 && (
            <div className="neu-card text-center py-12">
              <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum serviço cadastrado</p>
            </div>
          )}
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}
