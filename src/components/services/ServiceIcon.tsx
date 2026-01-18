// @ts-nocheck
'use client';

import { 
  FileText, 
  Utensils, 
  QrCode, 
  Receipt, 
  Palette, 
  CreditCard 
} from 'lucide-react';

interface ServiceIconProps {
  type: string;
  className?: string;
}

/**
 * ServiceIcon - Maps service types to Lucide components
 * Provides a consistent icon set for the OneKit ecosystem.
 */
export const ServiceIcon = ({ type, className }: ServiceIconProps) => {
  const icons = {
    document: <FileText className={className} />,
    menu: <Utensils className={className} />,
    qr: <QrCode className={className} />,
    invoice: <Receipt className={className} />,
    logo: <Palette className={className} />,
    card: <CreditCard className={className} />,
  };

  return icons[type as keyof typeof icons] || <FileText className={className} />;
};
