import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ServiceCard } from '@/components/client/ServiceCard';
import { ClientBottomNav } from '@/components/client/ClientBottomNav';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  nome: string;
  descricao: string | null;
  duracao: number;
  valor: number | null;
  exibir_valor: boolean;
  requer_anamnese: boolean;
}

interface AvailableTime {
  id: string;
  data: string;
  hora: string;
}

interface AnamneseQuestion {
  id: string;
  pergunta: string;
  tipo: string;
  ordem: number;
}

const steps = ['Serviço', 'Data', 'Horário', 'Anamnese', 'Confirmação'];

export default function BookService() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<AvailableTime[]>([]);
  const [anamneseQuestions, setAnamneseQuestions] = useState<AnamneseQuestion[]>([]);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<AvailableTime | null>(null);
  const [anamneseAnswers, setAnamneseAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      fetchAvailableDates();
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedService?.requer_anamnese) {
      fetchAnamneseQuestions();
    }
  }, [selectedService]);

  const fetchServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('ativo', true)
      .order('nome');
    
    setServices(data || []);
  };

  const fetchAvailableDates = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const { data } = await supabase
      .from('available_times')
      .select('data')
      .eq('ativo', true)
      .gte('data', today)
      .order('data');
    
    const uniqueDates = [...new Set(data?.map(t => t.data) || [])];
    setAvailableDates(uniqueDates);
  };

  const fetchAvailableTimes = async (date: string) => {
    // Get all available times for this date
    const { data: allTimes } = await supabase
      .from('available_times')
      .select('*')
      .eq('data', date)
      .eq('ativo', true)
      .order('hora');

    // Get booked appointments for this date
    const { data: bookedAppointments } = await supabase
      .from('appointments')
      .select('hora')
      .eq('data', date)
      .in('status', ['pendente', 'confirmado']);

    const bookedHours = bookedAppointments?.map(a => a.hora) || [];
    const availableTimes = (allTimes || []).filter(t => !bookedHours.includes(t.hora));
    
    setAvailableTimes(availableTimes);
  };

  const fetchAnamneseQuestions = async () => {
    const { data } = await supabase
      .from('anamnese_questions')
      .select('*')
      .eq('ativo', true)
      .order('ordem');
    
    setAnamneseQuestions(data || []);
  };

  const handleNext = () => {
    if (currentStep === 0 && !selectedService) {
      toast.error('Selecione um serviço');
      return;
    }
    if (currentStep === 1 && !selectedDate) {
      toast.error('Selecione uma data');
      return;
    }
    if (currentStep === 2 && !selectedTime) {
      toast.error('Selecione um horário');
      return;
    }
    
    // Skip anamnese step if not required
    if (currentStep === 2 && !selectedService?.requer_anamnese) {
      setCurrentStep(4);
      return;
    }
    
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    // Handle skipping anamnese when going back
    if (currentStep === 4 && !selectedService?.requer_anamnese) {
      setCurrentStep(2);
      return;
    }
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleConfirm = async () => {
    if (!user || !selectedService || !selectedDate || !selectedTime) return;
    
    setIsLoading(true);
    
    const { error } = await supabase
      .from('appointments')
      .insert([{
        user_id: user.id,
        service_id: selectedService.id,
        data: selectedDate,
        hora: selectedTime.hora,
        anamnese_json: selectedService.requer_anamnese ? anamneseAnswers : null,
      }]);

    if (error) {
      toast.error('Erro ao criar agendamento');
      setIsLoading(false);
      return;
    }

    toast.success('Agendamento realizado com sucesso!');
    navigate('/client');
    setIsLoading(false);
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
              Escolha o serviço
            </h2>
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                nome={service.nome}
                descricao={service.descricao || undefined}
                duracao={service.duracao}
                valor={service.valor || undefined}
                exibirValor={service.exibir_valor}
                requerAnamnese={service.requer_anamnese}
                selected={selectedService?.id === service.id}
                onClick={() => setSelectedService(service)}
              />
            ))}
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
              Escolha a data
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "p-4 rounded-2xl text-center transition-all duration-300",
                    selectedDate === date
                      ? "bg-primary text-white shadow-glow-primary"
                      : "neu-card hover:scale-[1.02]"
                  )}
                >
                  <Calendar className="w-5 h-5 mx-auto mb-2" />
                  <p className="font-medium">
                    {format(parseISO(date), "d 'de' MMM", { locale: ptBR })}
                  </p>
                  <p className="text-sm opacity-70">
                    {format(parseISO(date), 'EEEE', { locale: ptBR })}
                  </p>
                </button>
              ))}
            </div>
            {availableDates.length === 0 && (
              <div className="neu-card text-center py-8">
                <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma data disponível</p>
              </div>
            )}
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
              Escolha o horário
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {availableTimes.map((time) => (
                <button
                  key={time.id}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    "p-4 rounded-2xl text-center transition-all duration-300",
                    selectedTime?.id === time.id
                      ? "bg-primary text-white shadow-glow-primary"
                      : "neu-card hover:scale-[1.02]"
                  )}
                >
                  <Clock className="w-5 h-5 mx-auto mb-2" />
                  <p className="font-medium">{time.hora}</p>
                </button>
              ))}
            </div>
            {availableTimes.length === 0 && (
              <div className="neu-card text-center py-8">
                <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum horário disponível</p>
              </div>
            )}
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
              Formulário de Anamnese
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Por favor, responda às perguntas abaixo para garantir um atendimento seguro.
            </p>
            <div className="space-y-6">
              {anamneseQuestions.map((question) => (
                <div key={question.id} className="neu-card">
                  <label className="block font-medium text-foreground mb-3">
                    {question.pergunta}
                  </label>
                  {question.tipo === 'boolean' ? (
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant={anamneseAnswers[question.pergunta] === true ? 'default' : 'outline'}
                        onClick={() => setAnamneseAnswers({
                          ...anamneseAnswers,
                          [question.pergunta]: true,
                        })}
                      >
                        Sim
                      </Button>
                      <Button
                        type="button"
                        variant={anamneseAnswers[question.pergunta] === false ? 'default' : 'outline'}
                        onClick={() => setAnamneseAnswers({
                          ...anamneseAnswers,
                          [question.pergunta]: false,
                        })}
                      >
                        Não
                      </Button>
                    </div>
                  ) : (
                    <Input
                      placeholder="Sua resposta..."
                      value={anamneseAnswers[question.pergunta] || ''}
                      onChange={(e) => setAnamneseAnswers({
                        ...anamneseAnswers,
                        [question.pergunta]: e.target.value,
                      })}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
              Confirme seu agendamento
            </h2>
            
            <div className="neu-card space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Serviço</p>
                  <p className="font-semibold text-foreground">{selectedService?.nome}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-rose" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data e Horário</p>
                  <p className="font-semibold text-foreground">
                    {selectedDate && format(parseISO(selectedDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-foreground">{selectedTime?.hora}</p>
                </div>
              </div>
              
              {selectedService?.exibir_valor && selectedService.valor && (
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor</span>
                    <span className="text-xl font-bold text-gradient-primary">
                      R$ {selectedService.valor.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Ao confirmar, você receberá uma notificação com os detalhes do agendamento.
            </p>
          </div>
        );
    }
  };

  // Calculate visible steps (skip anamnese if not required)
  const visibleSteps = selectedService?.requer_anamnese 
    ? steps 
    : steps.filter((_, i) => i !== 3);
  
  const visibleCurrentStep = !selectedService?.requer_anamnese && currentStep > 3 
    ? currentStep - 1 
    : currentStep;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Novo Agendamento</h1>
        </div>
        
        {/* Progress */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            {visibleSteps.map((step, index) => (
              <div
                key={step}
                className={cn(
                  "flex items-center gap-2",
                  index <= visibleCurrentStep ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    index < visibleCurrentStep && "bg-primary text-white",
                    index === visibleCurrentStep && "bg-primary/20 text-primary border-2 border-primary",
                    index > visibleCurrentStep && "bg-muted text-muted-foreground"
                  )}
                >
                  {index < visibleCurrentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className="hidden sm:inline text-xs">{step}</span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-rose transition-all duration-500"
              style={{ width: `${((visibleCurrentStep + 1) / visibleSteps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {getStepContent()}
      </div>
      
      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border lg:bottom-0">
        <div className="flex gap-3 max-w-md mx-auto">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Voltar
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button variant="gradient" onClick={handleNext} className="flex-1">
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="gradient-rose"
              onClick={handleConfirm}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Confirmando...' : 'Confirmar Agendamento'}
            </Button>
          )}
        </div>
      </div>
      
      <ClientBottomNav />
    </div>
  );
}
