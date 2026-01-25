import React, { useState } from 'react';
import { ArrowLeft, Phone, User, Clock, Globe, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BookCallFormProps {
  onBack: () => void;
}

const TIMEZONES = [
  { value: 'Asia/Shanghai', label: 'China (UTC+8)', labelZh: '中国 (UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Japan (UTC+9)', labelZh: '日本 (UTC+9)' },
  { value: 'Asia/Singapore', label: 'Singapore (UTC+8)', labelZh: '新加坡 (UTC+8)' },
  { value: 'America/New_York', label: 'New York (UTC-5)', labelZh: '纽约 (UTC-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8)', labelZh: '洛杉矶 (UTC-8)' },
  { value: 'Europe/London', label: 'London (UTC+0)', labelZh: '伦敦 (UTC+0)' },
  { value: 'Europe/Paris', label: 'Paris (UTC+1)', labelZh: '巴黎 (UTC+1)' },
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
];

export function BookCallForm({ onBack }: BookCallFormProps) {
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = name.trim() && phone.trim() && date && time && timezone;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Editorial Color Stripe - Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-editorial-magenta via-editorial-coral via-editorial-yellow via-editorial-cyan to-editorial-violet" />

        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-border">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 shadow-lg">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-3 text-center tracking-tight">
            {language === 'zh' ? '预约成功！' : 'Booking Confirmed!'}
          </h2>
          <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-xs">
            {language === 'zh' 
              ? `我们将在 ${format(date!, 'yyyy年M月d日')} ${time} 给您回电。` 
              : `We will call you on ${format(date!, 'MMM d, yyyy')} at ${time}.`}
          </p>
          <Button 
            onClick={onBack}
            className="mt-8 bg-foreground hover:bg-foreground/90 text-background font-semibold px-8"
          >
            {language === 'zh' ? '返回' : 'Done'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Editorial Color Stripe - Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-editorial-magenta via-editorial-coral via-editorial-yellow via-editorial-cyan to-editorial-violet" />

      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-border">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="ml-2 text-lg font-bold text-foreground tracking-tight">
          {language === 'zh' ? '预约电话咨询' : 'Book a Call'}
        </h1>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4">
        <p className="text-sm text-muted-foreground mb-5">
          {language === 'zh' 
            ? '填写您的信息，我们将在您选择的时间回电。' 
            : 'Fill in your details and we will call you at your selected time.'}
        </p>

        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              {language === 'zh' ? '姓名' : 'Name'}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'zh' ? '请输入您的姓名' : 'Enter your name'}
              maxLength={100}
              className="bg-background border-2 border-border focus:border-foreground transition-colors"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              {language === 'zh' ? '电话号码' : 'Phone Number'}
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={language === 'zh' ? '请输入您的电话号码' : 'Enter your phone number'}
              type="tel"
              maxLength={20}
              className="bg-background border-2 border-border focus:border-foreground transition-colors"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              {language === 'zh' ? '可用日期' : 'Available Date'}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background border-2 border-border hover:border-foreground transition-colors",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(date, language === 'zh' ? 'yyyy年M月d日' : 'PPP') : (language === 'zh' ? '选择日期' : 'Pick a date')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              {language === 'zh' ? '可用时间' : 'Available Time'}
            </label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="bg-background border-2 border-border focus:border-foreground transition-colors">
                <SelectValue placeholder={language === 'zh' ? '选择时间' : 'Select time'} />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timezone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              {language === 'zh' ? '时区' : 'Timezone'}
            </label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="bg-background border-2 border-border focus:border-foreground transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {language === 'zh' ? tz.labelZh : tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="px-4 pb-6 pt-3 border-t border-border">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold py-3 disabled:opacity-50"
        >
          {isSubmitting 
            ? (language === 'zh' ? '提交中...' : 'Submitting...') 
            : (language === 'zh' ? '提交预约' : 'Submit Booking')}
        </Button>
      </div>
    </div>
  );
}
