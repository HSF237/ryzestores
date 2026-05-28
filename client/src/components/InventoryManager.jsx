import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Upload, Package, DollarSign, Layout, Type, Palette, Maximize, Truck, Loader2, Percent, Ticket, Search } from 'lucide-react'
import { productService } from '../services/firebaseService'

export default function InventoryManager() {
   const [products, setProducts] = useState([])
   const [isAdding, setIsAdding] = useState(false)
   const [isEditing, setIsEditing] = useState(false)
   const [editingId, setEditingId] = useState(null)
   const [loading, setLoading] = useState(true)
   const [submitting, setSubmitting] = useState(false)

   const [imageFiles, setImageFiles] = useState([null, null, null, null])
   const [colorInput, setColorInput] = useState({ name: '', hex: '#000000' })
   const [sizeInput, setSizeInput] = useState({ name: '' })
   const [formData, setFormData] = useState({
      smallHeading: '',
      longDescription: '',
      category: 'Footwear',
      price: '',
      discountPrice: '',
      deliveryCharge: '0',
      sizes: [],
      colors: [],
      sizeVariants: [],
      imageUrl1: '',
      imageUrl2: '',
      imageUrl3: '',
      imageUrl4: '',
      taxRate: '12',
      productVoucher: '',
      productVoucherDiscount: '0',
      searchKeywords: '',
      customizable: false,
      customizationLabel: '',
      supplierLink: '',
   })

   useEffect(() => {
      fetchProducts()
   }, [])

   const fetchProducts = async () => {
      try {
         const res = await productService.getProducts()
         setProducts(res.products)
      } catch (err) {
         console.error('Failed to fetch products', err)
      } finally {
         setLoading(false)
      }
   }

   const handleEditClick = (product) => {
      setEditingId(product._id)
      setIsEditing(true)
      setIsAdding(true)
      setFormData({
         smallHeading: product.retailHeading || '',
         longDescription: product.longDescription || product.description || '',
         category: product.category || 'Footwear',
         price: product.regularPrice || '',
         discountPrice: product.discountPrice || '',
         deliveryCharge: product.deliveryCharge || '0',
         sizes: product.sizes || [],
         colors: (product.colors || []).map(c => ({ ...c, images: c.images || ['', '', '', ''], supplierLink: c.supplierLink || '' })),
         sizeVariants: (product.sizeVariants || []).map(sv => ({ ...sv, images: sv.images || ['', '', '', ''], supplierLink: sv.supplierLink || '' })),
         imageUrl1: product.images?.[0] || '',
         imageUrl2: product.images?.[1] || '',
         imageUrl3: product.images?.[2] || '',
         imageUrl4: product.images?.[3] || '',
         taxRate: product.taxRate || '12',
         productVoucher: product.productVoucher || '',
         productVoucherDiscount: product.productVoucherDiscount || '0',
         searchKeywords: (product.searchKeywords || []).join(', '),
         customizable: product.customizable || false,
         customizationLabel: product.customizationLabel || '',
         supplierLink: product.supplierLink || '',
      })
   }

   const handleSaveProduct = async (e) => {
      e.preventDefault()
      setSubmitting(true)

      try {
         const data = new FormData()
         data.append('retailHeading', formData.smallHeading)
         data.append('longDescription', formData.longDescription)
         data.append('category', formData.category)
         data.append('regularPrice', formData.price)
         data.append('discountPrice', formData.discountPrice)
         data.append('deliveryCharge', formData.deliveryCharge)

         data.append('sizes', JSON.stringify(formData.sizes))
         data.append('colors', JSON.stringify(formData.colors))
         data.append('sizeVariants', JSON.stringify(formData.sizeVariants))

         imageFiles.forEach(file => { if (file) data.append('images', file) })

         data.append('productVoucher', formData.productVoucher)
         data.append('productVoucherDiscount', formData.productVoucherDiscount)
         data.append('taxRate', formData.taxRate)
         data.append('searchKeywords', formData.searchKeywords)
         data.append('customizable', formData.customizable)
         data.append('customizationLabel', formData.customizationLabel)
         data.append('supplierLink', formData.supplierLink)

         const urls = [formData.imageUrl1, formData.imageUrl2, formData.imageUrl3, formData.imageUrl4].filter(u => u && u.startsWith('http'))
         urls.forEach(url => data.append('images', url))

         if (isEditing) {
            await productService.updateProduct(editingId, data)
         } else {
            await productService.createProduct(data)
         }

         setIsAdding(false)
         setIsEditing(false)
         setEditingId(null)
         setFormData({
            smallHeading: '', longDescription: '', category: 'Footwear', price: '',
            discountPrice: '', deliveryCharge: '0', sizes: [], colors: [], sizeVariants: [],
            imageUrl1: '', imageUrl2: '', imageUrl3: '', imageUrl4: '',
            taxRate: '12', productVoucher: '', productVoucherDiscount: '0', searchKeywords: '',
            customizable: false, customizationLabel: '', supplierLink: ''
         })
         setImageFiles([null, null, null, null])
         fetchProducts()
      } catch (err) {
         alert(err?.message || 'Transaction failed')
      } finally {
         setSubmitting(false)
      }
   }

   const handleDelete = async (id) => {
      if (!window.confirm('Erase this item from existence?')) return
      try {
         await productService.deleteProduct(id)
         fetchProducts()
      } catch (err) {
         alert('Failed to delete product')
      }
   }

   const toggleSize = (size) => {
      setFormData(prev => ({
         ...prev,
         sizes: prev.sizes.includes(size)
            ? prev.sizes.filter(s => s !== size)
            : [...prev.sizes, size]
      }))
   }

   const addColor = () => {
      if (!colorInput.name.trim()) return
      setFormData(prev => ({
         ...prev,
         colors: [...prev.colors, { name: colorInput.name.trim(), hex: colorInput.hex, images: ['', '', '', ''], supplierLink: '' }]
      }))
      setColorInput({ name: '', hex: '#000000' })
   }

   const removeColor = (index) => {
      setFormData(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }))
   }

   const updateColorImage = (colorIndex, imgIndex, url) => {
      setFormData(prev => ({
         ...prev,
         colors: prev.colors.map((c, i) => {
            if (i !== colorIndex) return c
            const images = [...(c.images || ['', '', '', ''])]
            images[imgIndex] = url
            return { ...c, images }
         })
      }))
   }

   const updateColorLink = (colorIndex, url) => {
      setFormData(prev => ({
         ...prev,
         colors: prev.colors.map((c, i) => i !== colorIndex ? c : { ...c, supplierLink: url })
      }))
   }

   const addSizeVariant = () => {
      if (!sizeInput.name.trim()) return
      setFormData(prev => ({
         ...prev,
         sizeVariants: [...prev.sizeVariants, { name: sizeInput.name.trim(), images: ['', '', '', ''], supplierLink: '' }]
      }))
      setSizeInput({ name: '' })
   }

   const removeSizeVariant = (index) => {
      setFormData(prev => ({ ...prev, sizeVariants: prev.sizeVariants.filter((_, i) => i !== index) }))
   }

   const updateSizeVariantImage = (svIndex, imgIndex, url) => {
      setFormData(prev => ({
         ...prev,
         sizeVariants: prev.sizeVariants.map((sv, i) => {
            if (i !== svIndex) return sv
            const images = [...(sv.images || ['', '', '', ''])]
            images[imgIndex] = url
            return { ...sv, images }
         })
      }))
   }

   const updateSizeVariantLink = (svIndex, url) => {
      setFormData(prev => ({
         ...prev,
         sizeVariants: prev.sizeVariants.map((sv, i) => i !== svIndex ? sv : { ...sv, supplierLink: url })
      }))
   }

   const handleFileChange = (index, file) => {
      const newFiles = [...imageFiles]
      newFiles[index] = file
      setImageFiles(newFiles)
   }

   return (
      <div className="space-y-8">
         <div className="flex items-center justify-between">
            <div>
               <h2 className="text-2xl font-outfit font-black text-white">ryze Inventory</h2>
               <p className="text-white/50 text-sm">Manage your store products like an Amazon Pro.</p>
            </div>
            <button
               onClick={() => { setIsAdding(true); setIsEditing(false); setEditingId(null); setFormData({ smallHeading: '', longDescription: '', category: 'Footwear', price: '', discountPrice: '', deliveryCharge: '0', sizes: [], colors: [], sizeVariants: [], imageUrl1: '', imageUrl2: '', imageUrl3: '', imageUrl4: '', taxRate: '12', productVoucher: '', productVoucherDiscount: '0', searchKeywords: '', customizable: false, customizationLabel: '', supplierLink: '' }); }}
               className="bg-[#c9a962] text-black font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-[#b09452] transition-colors shadow-lg shadow-[#c9a962]/20"
            >
               <Plus className="w-5 h-5" /> Add New Product
            </button>
         </div>

         {/* Product List */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
               <div className="col-span-full py-20 flex justify-center">
                  <Loader2 className="w-8 h-8 text-[#c9a962] animate-spin" />
               </div>
            ) : products.length === 0 ? (
               <div className="col-span-full py-20 glass rounded-3xl flex flex-col items-center justify-center border-dashed border-white/10">
                  <Package className="w-12 h-12 text-white/10 mb-4" />
                  <p className="text-white/30 font-bold uppercase tracking-widest text-xs">No Items in Inventory</p>
               </div>
            ) : (
               products.map(p => (
                  <div key={p._id} className="glass rounded-2xl p-4 flex gap-4 border-white/5 group relative">
                     <img src={p.images?.[0] || 'https://via.placeholder.com/100'} className="w-20 h-20 rounded-lg object-cover bg-white/5" alt="" />
                     <div>
                        <h4 className="font-bold text-white text-sm line-clamp-1">{p.retailHeading}</h4>
                        <p className="text-[10px] text-[#c9a962] font-black uppercase tracking-wider">{p.category}</p>
                        <p className="text-xs font-bold text-white/50 mt-1">₹{(p.discountPrice || p.regularPrice)?.toLocaleString()}</p>
                     </div>
                     <div className="flex flex-col gap-2 absolute top-2 right-2">
                        <button
                           onClick={() => handleEditClick(p)}
                           className="p-1.5 glass rounded-lg text-white/40 hover:text-[#c9a962] hover:bg-white/5 transition-all"
                        >
                           <Type className="w-4 h-4" />
                        </button>
                        <button
                           onClick={() => handleDelete(p._id)}
                           className="p-1.5 glass rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-all"
                        >
                           <X className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               ))
            )}
         </div>

         {/* Add Product Modal (Amazon Seller Style) */}
         <AnimatePresence>
            {isAdding && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="absolute inset-0 bg-black/90 backdrop-blur-md"
                     onClick={() => setIsAdding(false)}
                  />
                  <motion.form
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     onSubmit={handleSaveProduct}
                     className="relative w-full max-w-4xl bg-[#111112] border border-white/10 rounded-3xl shadow-3xl overflow-hidden flex flex-col max-h-[90vh]"
                  >
                     {/* Header */}
                     <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-[#c9a962] flex items-center justify-center">
                              <Layout className="w-5 h-5 text-black" />
                           </div>
                           <div>
                              <h3 className="text-xl font-outfit font-black text-white uppercase tracking-tight">
                                 {isEditing ? 'Edit Master Protocol' : 'ryze Seller Central'}
                              </h3>
                              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">
                                 {isEditing ? `Vetting Object: ${editingId}` : 'Inventory Management Tool v2.4'}
                              </p>
                           </div>
                        </div>
                        <button type="button" onClick={() => setIsAdding(false)} className="p-2 glass rounded-full hover:bg-white/10 transition-colors">
                           <X className="w-5 h-5" />
                        </button>
                     </div>

                     {/* Body */}
                     <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                        {/* Section 1: Identity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-4">
                              <label className="flex items-center gap-2 text-xs font-black text-[#c9a962] uppercase tracking-widest">
                                 <Type className="w-3 h-3" /> Small Heading
                              </label>
                              <input
                                 required
                                 type="text"
                                 placeholder="e.g. Ultralight Pro V2"
                                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#c9a962]/50 outline-none transition-all"
                                 value={formData.smallHeading}
                                 onChange={e => setFormData({ ...formData, smallHeading: e.target.value })}
                              />
                           </div>
                           <div className="space-y-4">
                              <label className="flex items-center gap-2 text-xs font-black text-[#c9a962] uppercase tracking-widest">
                                 <Package className="w-3 h-3" /> Category
                              </label>
                              <select
                                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#c9a962]/50 outline-none transition-all appearance-none"
                                 value={formData.category}
                                 onChange={e => setFormData({ ...formData, category: e.target.value })}
                              >
                                 <option className="bg-[#111112]">Footwear</option>
                                 <option className="bg-[#111112]">Apparel</option>
                                 <option className="bg-[#111112]">Electronics</option>
                                 <option className="bg-[#111112]">Beauty</option>
                                 <option className="bg-[#111112]">Home</option>
                              </select>
                           </div>
                        </div>

                        {/* Section 2: Pricing & Fiscal */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="space-y-4">
                              <label className="flex items-center gap-2 text-xs font-black text-[#c9a962] uppercase tracking-widest">
                                 <DollarSign className="w-3 h-3" /> Regular Price
                              </label>
                              <input
                                 required
                                 type="number"
                                 placeholder="₹ 14,999"
                                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#c9a962]/50 outline-none transition-all"
                                 value={formData.price}
                                 onChange={e => setFormData({ ...formData, price: e.target.value })}
                              />
                           </div>
                           <div className="space-y-4">
                              <label className="flex items-center gap-2 text-xs font-black text-[#c9a962] uppercase tracking-widest">
                                 <DollarSign className="w-3 h-3" /> Offer Price
                              </label>
                              <input
                                 type="number"
                                 placeholder="₹ 12,499"
                                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#c9a962]/50 outline-none transition-all"
                                 value={formData.discountPrice}
                                 onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                              />
                           </div>
                           <div className="space-y-4">
                              <label className="flex items-center gap-2 text-xs font-black text-[#c9a962] uppercase tracking-widest">
                                 <Percent className="w-3 h-3" /> Taxation %
                              </label>
                              <input
                                 type="number"
                                 placeholder="e.g. 12"
                                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#c9a962]/50 outline-none transition-all"
                                 value={formData.taxRate}
                                 onChange={e => setFormData({ ...formData, taxRate: e.target.value })}
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="space-y-4">
                              <label className="flex items-center gap-2 text-xs font-black text-[#c9a962] uppercase tracking-widest">
                                 <Truck className="w-3 h-3" /> Delivery Fee
                              </label>
                              <input
                                 type="number"
                                 placeholder="₹ 0"
                                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#c9a962]/50 outline-none transition-all"
                                 value={formData.deliveryCharge}
                                 onChange={e => setFormData({ ...formData, deliveryCharge: e.target.value })}
                              />
                           </div>
                           <div className="space-y-4">
                              <label className="flex items-center gap-2 text-xs font-black text-[#c9a962] uppercase tracking-widest">
                                 <Ticket className="w-3 h-3" /> Product Voucher Code
                              </label>
                              <input
                                 type="text"
                                 placeholder="e.g. NIKE10"
                                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#c9a962]/50 outline-none transition-all uppercase"
                                 value={formData.productVoucher}
                                 onChange={e => setFormData({ ...formData, productVoucher: e.target.value })}
                              />
                           </div>
                           <div className="space-y-4">
                              <label className="flex items-center gap-2 text-xs font-black text-[#c9a962] uppercase tracking-widest">
                                 <Percent className="w-3 h-3" /> Voucher Value (₹)
                              </label>
                              <input
                                 type="number"
                                 placeholder="₹ 500"
                                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#c9a962]/50 outline-none transition-all"
                                 value={formData.productVoucherDiscount}
                                 onChange={e => setFormData({ ...formData, productVoucherDiscount: e.target.value })}
                              />
                           </div>
                        </div>

                        {/* Section 3: Attributes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="space-y-5">
                              <label className="flex items-center gap-2 text-xs font-black text-[#c9a962] uppercase tracking-widest">
                                 <Maximize className="w-3 h-3" /> Standard Sizes
                              </label>
                              <div className="flex flex-wrap gap-2">
                                 {['XS', 'S', 'M', 'L', 'XL', '8', '9', '10', '11'].map(size => (
                                    <button
                                       key={size}
                                       type="button"
                                       onClick={() => toggleSize(size)}
                                       className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest border transition-all ${formData.sizes.includes(size)
                                             ? 'bg-[#c9a962] text-black border-[#c9a962]'
                                             : 'bg-white/5 text-white/40 border-white/10 hover:border-[#c9a962]/50'
                                          }`}
                                    >
                                       {size}
                                    </button>
                                 ))}
                              </div>
                           </div>
                           <div className="space-y-4">
                              <label className="flex items-center gap-2 text-xs font-black text-[#c9a962] uppercase tracking-widest">
                                 <Palette className="w-3 h-3" /> Colour Variants
                              </label>
                              {/* Add colour input */}
                              <div className="flex gap-2">
                                 <input
                                    type="text"
                                    placeholder="Colour name (e.g. Red)"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:border-[#c9a962]/50 outline-none transition-all"
                                    value={colorInput.name}
                                    onChange={e => setColorInput({ ...colorInput, name: e.target.value })}
                                 />
                                 <input
                                    type="color"
                                    className="w-12 h-10 rounded-xl border border-white/10 bg-white/5 cursor-pointer"
                                    value={colorInput.hex}
                                    onChange={e => setColorInput({ ...colorInput, hex: e.target.value })}
                                 />
                                 <button type="button" onClick={addColor} className="px-4 bg-[#c9a962] text-black rounded-xl font-bold text-xs uppercase transition-all hover:opacity-90 flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Add
                                 </button>
                              </div>
                              {/* Added colours with image slots */}
                              {formData.colors.length > 0 && (
                                 <div className="space-y-4 mt-2">
                                    {formData.colors.map((color, ci) => (
                                       <div key={ci} className="border border-white/10 rounded-2xl p-4 bg-white/[0.02] space-y-3">
                                          <div className="flex items-center justify-between">
                                             <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full border border-white/20" style={{ background: color.hex }} />
                                                <span className="text-sm font-black text-white">{color.name}</span>
                                             </div>
                                             <button type="button" onClick={() => removeColor(ci)} className="text-red-400/60 hover:text-red-400 transition-colors">
                                                <X className="w-4 h-4" />
                                             </button>
                                          </div>
                                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Images for {color.name} (paste URLs)</p>
                                          <div className="grid grid-cols-2 gap-2">
                                             {[0, 1, 2, 3].map(imgIdx => (
                                                <input
                                                   key={imgIdx}
                                                   type="url"
                                                   placeholder={`Image ${imgIdx + 1} URL`}
                                                   className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-[#c9a962]/50 outline-none transition-all"
                                                   value={color.images?.[imgIdx] || ''}
                                                   onChange={e => updateColorImage(ci, imgIdx, e.target.value)}
                                                />
                                             ))}
                                          </div>
                                          <input
                                             type="url"
                                             placeholder="Supplier link for this colour (Meesho/DeoDap URL)"
                                             className="w-full bg-blue-500/[0.05] border border-blue-500/20 rounded-xl px-3 py-2 text-xs focus:border-blue-400/50 outline-none transition-all placeholder-white/20"
                                             value={color.supplierLink || ''}
                                             onChange={e => updateColorLink(ci, e.target.value)}
                                          />
                                       </div>
                                    ))}
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Section 3b: Size Variants (images + supplier links per size) */}
                        <div className="space-y-4">
                           <label className="flex items-center gap-2 text-xs font-black text-[#c9a962] uppercase tracking-widest">
                              <Maximize className="w-3 h-3" /> Size Variants <span className="text-white/20 font-medium normal-case tracking-normal text-[10px]">(optional — add images & supplier links per size)</span>
                           </label>
                           <div className="flex gap-2">
                              <input
                                 type="text"
                                 placeholder="Size name (e.g. Small, 10ml, 1-seater)"
                                 className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:border-[#c9a962]/50 outline-none transition-all"
                                 value={sizeInput.name}
                                 onChange={e => setSizeInput({ ...sizeInput, name: e.target.value })}
                                 onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSizeVariant())}
                              />
                              <button type="button" onClick={addSizeVariant} className="px-4 bg-[#c9a962] text-black rounded-xl font-bold text-xs uppercase transition-all hover:opacity-90 flex items-center gap-1 shrink-0">
                                 <Plus className="w-3 h-3" /> Add
                              </button>
                           </div>
                           {formData.sizeVariants.length > 0 && (
                              <div className="space-y-4">
                                 {formData.sizeVariants.map((sv, si) => (
                                    <div key={si} className="border border-white/10 rounded-2xl p-4 bg-white/[0.02] space-y-3">
                                       <div className="flex items-center justify-between">
                                          <span className="text-sm font-black text-white">{sv.name}</span>
                                          <button type="button" onClick={() => removeSizeVariant(si)} className="text-red-400/60 hover:text-red-400 transition-colors">
                                             <X className="w-4 h-4" />
                                          </button>
                                       </div>
                                       <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Images for {sv.name} (paste URLs)</p>
                                       <div className="grid grid-cols-2 gap-2">
                                          {[0, 1, 2, 3].map(imgIdx => (
                                             <input
                                                key={imgIdx}
                                                type="url"
                                                placeholder={`Image ${imgIdx + 1} URL`}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-[#c9a962]/50 outline-none transition-all"
                                                value={sv.images?.[imgIdx] || ''}
                                                onChange={e => updateSizeVariantImage(si, imgIdx, e.target.value)}
                                             />
                                          ))}
                                       </div>
                                       <input
                                          type="url"
                                          placeholder="Supplier link for this size (Meesho/DeoDap URL)"
                                          className="w-full bg-blue-500/[0.05] border border-blue-500/20 rounded-xl px-3 py-2 text-xs focus:border-blue-400/50 outline-none transition-all placeholder-white/20"
                                          value={sv.supplierLink || ''}
                                          onChange={e => updateSizeVariantLink(si, e.target.value)}
                                       />
                                    </div>
                                 ))}
                              </div>
                           )}
                           <p className="text-[9px] text-white/20 font-bold uppercase italic">Use when different sizes have different images or different supplier listings.</p>
                        </div>

                        {/* Section 4: Media */}
                        <div className="space-y-4">
                           <label className="flex items-center gap-2 text-xs font-black text-[#c9a962] uppercase tracking-widest">
                              <Upload className="w-3 h-3" /> Multi-Image Carousel (Upload or URL)
                           </label>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                              {[1, 2, 3, 4].map(i => (
                                 <div key={i} className="space-y-3">
                                    <label className="aspect-square glass rounded-2xl flex flex-col items-center justify-center overflow-hidden border-dashed border-white/10 hover:border-[#c9a962]/40 cursor-pointer transition-all group relative">
                                       {(imageFiles[i - 1] || formData[`imageUrl${i}`]) ? (
                                          <img
                                             src={imageFiles[i - 1] ? URL.createObjectURL(imageFiles[i - 1]) : formData[`imageUrl${i}`]}
                                             className="w-full h-full object-cover"
                                             alt=""
                                          />
                                       ) : (
                                          <>
                                             <Upload className="w-6 h-6 text-white/10 group-hover:text-[#c9a962]/60 transition-colors" />
                                             <span className="text-[10px] text-white/40 mt-2 font-black uppercase tracking-widest">Slot {i}</span>
                                             <span className="text-[8px] text-white/20 mt-1 font-bold uppercase">Click to Upload</span>
                                          </>
                                       )}
                                       <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={e => handleFileChange(i - 1, e.target.files[0])}
                                       />
                                    </label>
                                    <div className="relative group">
                                       <input
                                          type="text"
                                          placeholder={`Slot ${i} Image URL...`}
                                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] focus:border-[#c9a962]/50 outline-none transition-all pr-10"
                                          value={formData[`imageUrl${i}`]}
                                          onChange={e => setFormData({ ...formData, [`imageUrl${i}`]: e.target.value })}
                                       />
                                       <Layout className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/10 group-focus-within:text-[#c9a962]" />
                                    </div>
                                    {(imageFiles[i - 1] || formData[`imageUrl${i}`]) && (
                                       <button
                                          type="button"
                                          onClick={() => { handleFileChange(i - 1, null); setFormData({ ...formData, [`imageUrl${i}`]: '' }) }}
                                          className="w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20"
                                       >
                                          Remove {i}
                                       </button>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Section 5: Description */}
                        <div className="space-y-4">
                           <label className="flex items-center gap-2 text-xs font-black text-[#c9a962] uppercase tracking-widest">
                              <Type className="w-3 h-3" /> Detailed Description
                           </label>
                           <textarea
                              rows={4}
                              placeholder="Describe the product in detail for ryze customers..."
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#c9a962]/50 outline-none transition-all resize-none"
                              value={formData.longDescription}
                              onChange={e => setFormData({ ...formData, longDescription: e.target.value })}
                           />
                        </div>

                        {/* Section 6: Smart Search */}
                        <div className="space-y-4 pb-4">
                           <label className="flex items-center gap-2 text-xs font-black text-[#c9a962] uppercase tracking-widest">
                              <Search className="w-3 h-3" /> Smart Search Keywords (Comma separated)
                           </label>
                           <input
                              type="text"
                              placeholder="e.g. shoe, snekers, running, leather"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#c9a962]/50 outline-none transition-all"
                              value={formData.searchKeywords}
                              onChange={e => setFormData({ ...formData, searchKeywords: e.target.value })}
                           />
                           <p className="text-[9px] text-white/20 font-bold uppercase italic text-center">Add misspellings or related terms to help customers find this product.</p>
                        </div>

                        {/* Section 7: Supplier Link (Staff Only — hidden from customers) */}
                        <div className="space-y-3 pb-4 border border-blue-500/10 rounded-2xl p-5 bg-blue-500/[0.03]">
                           <label className="flex items-center gap-2 text-xs font-black text-blue-400 uppercase tracking-widest">
                              🔒 Supplier Link <span className="text-white/20 font-medium normal-case tracking-normal">(Staff only — never shown to customers)</span>
                           </label>
                           <input
                              type="url"
                              placeholder="https://deodap.in/products/... or meesho.com/..."
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-400/50 outline-none transition-all"
                              value={formData.supplierLink}
                              onChange={e => setFormData({ ...formData, supplierLink: e.target.value })}
                           />
                           <p className="text-[9px] text-white/20 font-bold uppercase">Paste the Meesho / DeoDap / supplier URL. When you get an order, you'll see a one-click button to open this and place the order.</p>
                        </div>

                        {/* Section 8: Customization */}
                        <div className="space-y-4 pb-4 border border-white/5 rounded-2xl p-5 bg-white/[0.02]">
                           <div className="flex items-center justify-between">
                              <label className="flex items-center gap-2 text-xs font-black text-[#c9a962] uppercase tracking-widest">
                                 Customizable Product
                              </label>
                              <button
                                 type="button"
                                 onClick={() => setFormData({ ...formData, customizable: !formData.customizable })}
                                 className={`w-12 h-6 rounded-full transition-all relative ${formData.customizable ? 'bg-[#c9a962]' : 'bg-white/10'}`}
                              >
                                 <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${formData.customizable ? 'left-6' : 'left-0.5'}`} />
                              </button>
                           </div>
                           {formData.customizable && (
                              <div className="space-y-2 pt-2">
                                 <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Customization Prompt (shown to customer)</label>
                                 <input
                                    type="text"
                                    placeholder="e.g. Enter both names (Name 1 & Name 2)"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#c9a962]/50 outline-none transition-all"
                                    value={formData.customizationLabel}
                                    onChange={e => setFormData({ ...formData, customizationLabel: e.target.value })}
                                 />
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Footer */}
                     <div className="px-8 py-6 border-t border-white/5 bg-white/2 flex justify-end gap-3 shrink-0">
                        <button
                           type="button"
                           onClick={() => setIsAdding(false)}
                           className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                        >
                           Discard
                        </button>
                        <button
                           type="submit"
                           disabled={submitting}
                           className="bg-[#c9a962] text-black font-black px-10 py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-[#b09452] transition-colors shadow-xl shadow-[#c9a962]/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                           {submitting ? (
                              <>
                                 <Loader2 className="w-4 h-4 animate-spin" />
                                 {isEditing ? 'Updating Vault...' : 'Listing...'}
                              </>
                           ) : (
                              isEditing ? 'Secure Update' : 'List Product'
                           )}
                        </button>
                     </div>
                  </motion.form>
               </div>
            )}
         </AnimatePresence>
      </div>
   )
}
