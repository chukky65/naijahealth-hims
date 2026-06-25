import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui/core';
import { useStore } from '../store/useStore';
import { Search, Plus, Filter, Download, Receipt, CreditCard, Banknote, X } from 'lucide-react';
import { format } from 'date-fns';
import { Invoice } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const invoiceSchema = z.object({
  patientName: z.string().min(2, "Patient Name is required"),
  amount: z.coerce.number().min(1, "Amount must be a valid positive number"),
  type: z.enum(['Out of Pocket', 'NHIA', 'Private Insurance']),
  status: z.enum(['Pending', 'Settled', 'Overdue'])
});
type InvoiceFormValues = z.infer<typeof invoiceSchema>;



export const Billing = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { user, invoices, addInvoice, isLoading } = useStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      type: 'Out of Pocket',
      status: 'Pending',
    }
  });

  const handleCreateInvoice = async (data: InvoiceFormValues) => {
    await addInvoice({
      patientName: data.patientName,
      amount: data.amount,
      type: data.type,
      status: data.status,
      date: new Date().toISOString()
    });
    toast.success('Invoice Created Successfully', {
      description: `Invoice generated for ${data.patientName}`
    });
    setIsAddModalOpen(false);
    reset();
  };

  const filteredInvoices = invoices?.filter(inv => 
    inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Settled': return <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">Settled</Badge>;
      case 'Pending': return <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">Pending</Badge>;
      case 'Overdue': return <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">Overdue</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Out of Pocket': return <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'NHIA': return <Receipt className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'Private Insurance': return <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default: return <Receipt className="w-4 h-4" />;
    }
  };

  const canCreateInvoice = user?.role === 'Admin' || user?.role === 'Receptionist';

  const generateInvoicePDF = (inv: Invoice) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(14, 165, 233); // Sky-500
    doc.text('NaijaHealth HIMS', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('Official Medical Invoice', 14, 28);
    
    // Invoice Meta
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text(`Invoice ID: ${inv.id}`, 14, 45);
    doc.text(`Date: ${format(new Date(inv.date), 'MMMM dd, yyyy')}`, 14, 52);
    doc.text(`Status: ${inv.status}`, 14, 59);
    
    // Patient Details
    doc.text(`Patient Name: ${inv.patientName}`, 120, 45);
    doc.text(`Payment Type: ${inv.type}`, 120, 52);

    // Table
    autoTable(doc, {
      startY: 70,
      head: [['Description', 'Amount']],
      body: [
        ['Medical Services / Consultation', `NGN ${inv.amount.toLocaleString()}`],
        ['Tax (0%)', 'NGN 0.00'],
      ],
      foot: [['Total', `NGN ${inv.amount.toLocaleString()}`]],
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233] },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] }
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text('Thank you for choosing NaijaHealth Elite System.', 14, finalY);

    doc.save(`Invoice_${inv.id}.pdf`);
    toast.success(`Downloaded Invoice ${inv.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('billing.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t('billing.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" aria-label={t('billing.export')}>
            <Download className="w-4 h-4" aria-hidden="true" /> {t('billing.export')}
          </button>
          {canCreateInvoice && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
              aria-label={t('billing.newInvoice')}
            >
              <Plus className="w-4 h-4" aria-hidden="true" /> {t('billing.newInvoice')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 font-medium mb-1">Total Outstanding</p>
                <h3 className="text-3xl font-bold">₦167,000</h3>
              </div>
              <div className="p-3 bg-white/10 rounded-xl">
                <Banknote className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-emerald-400 font-medium">+5%</span>
              <span className="text-slate-400">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Pending NHIA Claims</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">₦77,000</h3>
              </div>
              <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
                <Receipt className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-sky-500 font-medium">12 Claims</span>
              <span className="text-slate-500 dark:text-slate-400">awaiting settlement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Today's Collections</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">₦53,500</h3>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-emerald-500 font-medium">+12%</span>
              <span className="text-slate-500 dark:text-slate-400">vs yesterday</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoices or patients..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">{t('billing.invoiceId')}</th>
                <th className="px-6 py-4">{t('billing.patient')}</th>
                <th className="px-6 py-4">{t('billing.date')}</th>
                <th className="px-6 py-4">{t('billing.type')}</th>
                <th className="px-6 py-4">{t('billing.amount')}</th>
                <th className="px-6 py-4">{t('billing.status')}</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-2" />
                      Loading billing records...
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No matching invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices?.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {inv.id}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {inv.patientName}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {format(new Date(inv.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        {getTypeIcon(inv.type)}
                        {inv.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      ₦{inv.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => generateInvoicePDF(inv)}
                        className="text-sky-600 hover:text-sky-700 font-medium text-sm transition-colors flex items-center justify-end gap-1 w-full"
                      >
                        <Download className="w-4 h-4" /> PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="font-semibold text-slate-900 dark:text-white">Generate Invoice</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="invoice-form" onSubmit={handleSubmit(handleCreateInvoice as any)} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Patient Name</label>
                  <input 
                    {...register('patientName')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50"
                    placeholder="Enter patient name"
                  />
                  {errors.patientName && <p className="text-red-500 text-xs mt-1">{errors.patientName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₦)</label>
                  <input 
                    type="number"
                    {...register('amount')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50"
                    placeholder="0.00"
                  />
                  {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select 
                    {...register('type')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50"
                  >
                    <option value="Out of Pocket">Out of Pocket</option>
                    <option value="NHIA">NHIA</option>
                    <option value="Private Insurance">Private Insurance</option>
                  </select>
                  {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select 
                    {...register('status')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Settled">Settled</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                  {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
                </div>

              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50 mt-auto">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button 
                form="invoice-form"
                type="submit"
                className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700 transition-colors"
              >
                Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
