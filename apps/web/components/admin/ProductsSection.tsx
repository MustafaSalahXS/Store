'use client'

import React from 'react'
import { Plus, Edit, Trash2, Download, Upload, ShoppingCart, Package } from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { useLanguage } from '@/lib/language-context'

interface ProductsSectionProps {
  products: any[]
  currentStore: any
  onOpenCreate: () => void
  onOpenEdit: (product: any) => void
  onDelete: (id: string) => void
  onExportCsv: () => void
  csvFileRef: React.RefObject<HTMLInputElement | null>
  onCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  t: (key: string, fallback?: string) => string
}

export default function ProductsSection({
  products,
  currentStore,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  onExportCsv,
  csvFileRef,
  onCsvUpload,
  t
}: ProductsSectionProps) {
  const { isRTL } = useLanguage()

  return (
    <div className="space-y-6 md:space-y-8 pb-28 sm:pb-8 max-w-full overflow-hidden">
      <div className="bg-card rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] border border-border p-4 sm:p-6 md:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-10">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-primary shrink-0" />
              <span>{isRTL ? 'كتالوج وقائمة المنتجات' : t('admin.productCatalog', 'Product Catalog')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 font-medium" dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL ? 'إدارة كافة قطع الأزياء، الأسعار، المقاسات، المخزون، وربط ألوان الصور.' : t('admin.manageInventory', 'Manage products, pricing, sizes, inventory, and pictures.')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <button
              onClick={onExportCsv}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-secondary hover:bg-secondary/80 font-black rounded-xl md:rounded-2xl transition-all text-[10px] sm:text-xs tracking-wider uppercase border border-border/50 active:scale-95"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span>{isRTL ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>

            <button
              onClick={() => csvFileRef.current?.click()}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-secondary hover:bg-secondary/80 font-black rounded-xl md:rounded-2xl transition-all text-[10px] sm:text-xs tracking-wider uppercase border border-border/50 active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
              <span>{isRTL ? 'استيراد CSV' : 'Import CSV'}</span>
            </button>
            <input
              type="file"
              ref={csvFileRef}
              onChange={onCsvUpload}
              accept=".csv"
              className="hidden"
            />

            <button
              onClick={onOpenCreate}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-primary text-primary-foreground font-black rounded-xl md:rounded-2xl hover:bg-primary/90 transition-all shadow-xl text-xs sm:text-sm active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{isRTL ? 'منتج جديد +' : t('admin.newProduct', 'New Product')}</span>
            </button>
          </div>
        </div>

        {/* Mobile Product Cards List */}
        <div className="md:hidden space-y-3">
          {products.map((product: any) => (
            <div key={product.id} className="bg-stone-50 rounded-2xl p-3.5 border border-stone-100 space-y-3">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-xl bg-white border border-stone-100 overflow-hidden shrink-0">
                  <img src={product.image || (product.images && product.images[0]) || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-stone-900 text-sm truncate">{product.name}</h4>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{product.category}</p>
                  <div className="font-black text-primary text-xs mt-1 font-mono">
                    {formatPrice(product.price, currentStore?.currency || 'USD')}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-stone-200/50 pt-2.5 text-[10px] font-bold">
                <span className="text-stone-400">
                  {isRTL ? 'المخزون المتوفر:' : 'Stock:'}{' '}
                  <span className="text-stone-900 font-black font-mono">
                    {product.stock} {isRTL ? 'قطعة' : 'units'}
                  </span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  product.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {product.isActive ? (isRTL ? 'نشط بالمتجر' : 'Active') : (isRTL ? 'معطل' : 'Inactive')}
                </span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onOpenEdit(product)}
                  className="flex-1 py-2.5 bg-white border border-stone-100 rounded-xl font-black text-[10px] uppercase tracking-widest text-primary flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'تعديل المنتج' : t('admin.edit', 'Edit')}</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(isRTL ? `هل أنت متأكد من حذف المنتج "${product.name}"؟` : `Delete product "${product.name}"?`)) {
                      onDelete(product.id)
                    }
                  }}
                  className="flex-1 py-2.5 bg-red-50 border border-red-100 rounded-xl font-black text-[10px] uppercase tracking-widest text-red-500 flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'حذف' : t('admin.delete', 'Delete')}</span>
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="py-12 text-center text-muted-foreground font-bold italic text-sm">
              {isRTL ? 'لا توجد منتجات مضافة بعد.' : t('admin.noProducts', 'No products found.')}
            </div>
          )}
        </div>

        {/* Desktop Product Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-start rtl:text-right">
            <thead className="border-b border-border text-muted-foreground text-xs uppercase tracking-[0.2em]">
              <tr>
                <th className="py-5 px-4 font-black">{isRTL ? 'المنتج' : t('admin.product', 'Product')}</th>
                <th className="py-5 px-4 font-black">{isRTL ? 'التصنيف' : t('admin.category', 'Category')}</th>
                <th className="py-5 px-4 font-black">{isRTL ? 'السعر' : t('admin.price', 'Price')}</th>
                <th className="py-5 px-4 font-black">{isRTL ? 'المخزون' : t('admin.stock', 'Stock')}</th>
                <th className="py-5 px-4 font-black">{isRTL ? 'الحالة' : t('delivery.status', 'Status')}</th>
                <th className="py-5 px-4 text-end font-black">{isRTL ? 'الإجراءات' : t('admin.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any) => (
                <tr key={product.id} className="border-b border-stone-100 group hover:bg-stone-50 transition-colors">
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                        <img src={product.image || (product.images && product.images[0]) || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-stone-900">{product.name}</div>
                        <div className="text-xs text-stone-400 font-mono font-medium">SKU: {product.sku || product.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-5 px-4">
                    <span className="px-3 py-1 bg-stone-100 rounded-full text-xs font-bold text-stone-700">
                      {product.category}
                    </span>
                  </td>

                  <td className="py-5 px-4 font-mono font-black text-sm text-primary">
                    {formatPrice(product.price, currentStore?.currency || 'USD')}
                  </td>

                  <td className="py-5 px-4 font-mono font-bold text-xs sm:text-sm text-stone-700">
                    {product.stock} {isRTL ? 'قطعة' : 'units'}
                  </td>

                  <td className="py-5 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      product.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {product.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Inactive')}
                    </span>
                  </td>

                  <td className="py-5 px-4 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onOpenEdit(product)}
                        className="p-2 text-stone-400 hover:text-stone-900 bg-secondary rounded-lg hover:bg-stone-200 transition-colors"
                        title={isRTL ? 'تعديل' : 'Edit'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(isRTL ? `حذف المنتج "${product.name}"؟` : `Delete product "${product.name}"?`)) {
                            onDelete(product.id)
                          }
                        }}
                        className="p-2 text-stone-400 hover:text-rose-600 bg-secondary rounded-lg hover:bg-rose-50 transition-colors"
                        title={isRTL ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground font-bold italic text-sm">
                    {isRTL ? 'لا توجد منتجات مضافة بعد.' : t('admin.noProducts', 'No products found.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
