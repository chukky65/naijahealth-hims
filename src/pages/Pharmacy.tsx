import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui/core';
import { Package, AlertTriangle, TrendingDown, Plus, Search, X, ArrowUpDown, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { PharmacyItem } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useStore } from '../store/useStore';
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton';

const pharmacySchema = z.object({
  name: z.string().min(2, "Name required"),
  category: z.string().min(2, "Category required"),
  stockLevel: z.coerce.number().min(0),
  reorderLevel: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0),
  supplier: z.string().min(2, "Supplier required"),
  isNHIACovered: z.boolean(),
  expiryDate: z.string().min(2, "Expiry Date required"),
});
type PharmacyFormValues = z.infer<typeof pharmacySchema>;

export const Pharmacy = () => {
  const { pharmacyItems: items, addPharmacyItem: saveItems, isLoading, setIsLoading, user } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [setIsLoading]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
      }
    };
    if (isAddModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen]);
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof PharmacyItem; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PharmacyFormValues>({
    resolver: zodResolver(pharmacySchema) as any,
    defaultValues: {
      stockLevel: 0,
      reorderLevel: 20,
      unitPrice: 0,
      isNHIACovered: false,
      expiryDate: '2026-12-31'
    }
  });

  const onSubmit = (data: PharmacyFormValues) => {
    const newItem: PharmacyItem = {
      id: `DRG-${Math.floor(1000 + Math.random() * 9000)}`,
      ...data,
    };
    saveItems(newItem);
    setIsAddModalOpen(false);
    reset();
    toast.success('Item Added', {
      description: `${newItem.name} has been added to inventory.`,
    });
  };

  const handleSort = (key: keyof PharmacyItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter(i => 
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [items, searchQuery, sortConfig]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedItems.slice(start, start + itemsPerPage);
  }, [filteredAndSortedItems, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const lowStockItems = items.filter(item => item.stockLevel <= item.reorderLevel);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Pharmacy Inventory Report', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['ID', 'Medication', 'Category', 'Stock Level', 'Supplier', 'Price', 'NHIA']],
      body: filteredAndSortedItems.map(i => [
        i.id, i.name, i.category, i.stockLevel, i.supplier, i.unitPrice, i.isNHIACovered ? 'Yes' : 'No'
      ]),
    });
    doc.save('pharmacy-inventory.pdf');
    toast.success('Inventory report exported as PDF');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="p-4">
            <TableSkeleton rows={5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const canAddItem = user?.role === 'Pharmacist' || user?.role === 'Admin' || user?.role === 'MedicalDirector';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pharmacy Operations & Inventory</h1>
          <p className="text-slate-500">Monitor stock levels, supply chain, and medication management.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
          {canAddItem && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Total Unique Medicines</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{items.length}</h3>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Low Stock Alerts</p>
                <h3 className="text-2xl font-bold mt-1 text-red-500">{lowStockItems.length}</h3>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">NHIA Covered Drugs</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{items.filter(i => i.isNHIACovered).length}</h3>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Inventory Heatmap & Status</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search inventory..."
              aria-label="Search inventory"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-300">
              <tr>
                <th className="p-0">
                  <button onClick={() => handleSort('name')} aria-label="Sort by Medication Name" className="w-full h-full px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 text-left uppercase">
                    Medication <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-0">
                  <button onClick={() => handleSort('category')} aria-label="Sort by Category" className="w-full h-full px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 text-left uppercase">
                    Category <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-0">
                  <button onClick={() => handleSort('stockLevel')} aria-label="Sort by Stock Level" className="w-full h-full px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 text-left uppercase">
                    Stock Level <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-0">
                  <button onClick={() => handleSort('supplier')} aria-label="Sort by Supplier" className="w-full h-full px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 text-left uppercase">
                    Supplier <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-0">
                  <button onClick={() => handleSort('unitPrice')} aria-label="Sort by Unit Price" className="w-full h-full px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-end gap-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 text-right w-full uppercase">
                    <ArrowUpDown className="w-3 h-3" /> Unit Price (₦)
                  </button>
                </th>
                <th className="px-6 py-3 font-medium text-center">NHIA</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{item.id}</p>
                  </td>
                  <td className="px-6 py-4">{item.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 max-w-[100px] bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.stockLevel <= item.reorderLevel ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min((item.stockLevel / (item.reorderLevel * 3)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${item.stockLevel <= item.reorderLevel ? 'text-red-500' : ''}`}>
                        {item.stockLevel}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{item.supplier}</td>
                  <td className="px-6 py-4 text-right font-mono text-slate-900 dark:text-slate-300">
                    {item.unitPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.isNHIACovered ? (
                      <Badge variant="success">Covered</Badge>
                    ) : (
                      <Badge variant="default">OOP</Badge>
                    )}
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} items
          </p>
          <div className="flex items-center gap-1 text-sm">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-2 font-medium">{currentPage} / {Math.max(1, totalPages)}</span>
            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="add-item-title">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 id="add-item-title" className="text-xl font-bold">Add Inventory Item</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close add inventory item modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Item Name</label>
                <input {...register("name")} type="text" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Category</label>
                  <select {...register("category")} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50">
                    <option value="Analgesics">Analgesics</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Antimalarials">Antimalarials</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Consumables">Consumables</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Supplier</label>
                  <input {...register("supplier")} type="text" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" />
                  {errors.supplier && <p className="text-xs text-red-500">{errors.supplier?.message as string}</p>}
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Expiry Date</label>
                <input {...register("expiryDate")} type="date" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" />
                {errors.expiryDate && <p className="text-xs text-red-500">{errors.expiryDate?.message as string}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Stock</label>
                  <input {...register("stockLevel")} type="number" min="0" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Reorder At</label>
                  <input {...register("reorderLevel")} type="number" min="0" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Price (₦)</label>
                  <input {...register("unitPrice")} type="number" min="0" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-sky-500/50" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input {...register("isNHIACovered")} id="nhia" type="checkbox" className="w-4 h-4 text-sky-600 rounded border-slate-300" />
                <label htmlFor="nhia" className="text-sm font-medium text-slate-700 dark:text-slate-300">Covered by NHIA</label>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
