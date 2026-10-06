import React, { useState, useRef } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Check,
  Filter,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Product, FileFormat } from '../../types';
import {
  validatePreviewImage,
  uploadProductPreview,
  deleteProductPreview,
  formatFileSize
} from '../../lib/storageService';

export const ProductManagementPage: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, showToast } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Telugu Flex Banner PSD');
  const [price, setPrice] = useState('299');
  const [originalPrice, setOriginalPrice] = useState('599');
  const [fileFormat, setFileFormat] = useState<FileFormat>('PSD');
  const [fileSize, setFileSize] = useState('180 MB');
  const [dimensions, setDimensions] = useState('10 x 8 ft (120 x 96 in)');
  const [dpi, setDpi] = useState('100');
  const [colorMode, setColorMode] = useState<'CMYK' | 'RGB'>('CMYK');
  const [description, setDescription] = useState('');
  const [teluguFontsSupported, setTeluguFontsSupported] = useState(true);
  const [status, setStatus] = useState<'active' | 'draft'>('active');

  // Preview Image Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageFileSizeText, setImageFileSizeText] = useState<string>('');
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setCategory(categories[0]?.name || 'Telugu Flex Banner PSD');
    setPrice('299');
    setOriginalPrice('599');
    setFileFormat('PSD');
    setFileSize('180 MB');
    setDimensions('10 x 8 ft (120 x 96 in)');
    setDpi('100');
    setColorMode('CMYK');
    setDescription('');
    setTeluguFontsSupported(true);
    setStatus('active');
    setSelectedImageFile(null);
    setPreviewImageUrl('');
    setImageFileName('');
    setImageFileSizeText('');
    setImageError(null);
    setIsUploadingImage(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setCategory(p.category);
    setPrice(p.price.toString());
    setOriginalPrice(p.originalPrice.toString());
    setFileFormat(p.fileFormat);
    setFileSize(p.fileSize);
    setDimensions(p.dimensions);
    setDpi(p.dpi.toString());
    setColorMode(p.colorMode);
    setDescription(p.description);
    setTeluguFontsSupported(p.teluguFontsSupported);
    setStatus(p.status);
    setSelectedImageFile(null);
    setPreviewImageUrl(p.image || '');
    setImageFileName(p.image ? 'Current Template Image' : '');
    setImageFileSizeText('');
    setImageError(null);
    setIsUploadingImage(false);
    setIsModalOpen(true);
  };

  const handleFileProcess = (file: File) => {
    const validation = validatePreviewImage(file);
    if (!validation.valid) {
      setImageError(validation.error || 'Invalid image file.');
      return;
    }

    setImageError(null);
    setSelectedImageFile(file);
    setImageFileName(file.name);
    setImageFileSizeText(formatFileSize(file.size));
    const objectUrl = URL.createObjectURL(file);
    setPreviewImageUrl(objectUrl);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setPreviewImageUrl('');
    setImageFileName('');
    setImageFileSizeText('');
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Validate preview image is present
    if (!previewImageUrl) {
      setImageError('Please upload a preview image.');
      showToast('Please upload a preview image.');
      return;
    }

    setIsUploadingImage(true);
    let uploadedFilePath: string | undefined;
    let finalImageUrl = previewImageUrl;

    try {
      // If a new local file was selected, upload it to Supabase Storage
      if (selectedImageFile) {
        const uploadResult = await uploadProductPreview(selectedImageFile);
        if (!uploadResult.success || !uploadResult.publicUrl) {
          setImageError(uploadResult.error || 'Failed to upload preview image.');
          showToast(uploadResult.error || 'Image upload failed.');
          setIsUploadingImage(false);
          return;
        }
        finalImageUrl = uploadResult.publicUrl;
        uploadedFilePath = uploadResult.path;
      }

      const matchedCategory = categories.find((c) => c.name === category);
      const categorySlug = matchedCategory ? matchedCategory.slug : 'telugu-flex';

      if (editingProduct) {
        await updateProduct({
          ...editingProduct,
          title,
          category,
          categorySlug,
          price: Number(price) || 299,
          originalPrice: Number(originalPrice) || 599,
          image: finalImageUrl,
          fileFormat,
          fileSize,
          dimensions,
          dpi: Number(dpi) || 100,
          colorMode,
          description,
          teluguFontsSupported,
          status
        });
        showToast('Template updated successfully!');
      } else {
        await addProduct({
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          category,
          categorySlug,
          price: Number(price) || 299,
          originalPrice: Number(originalPrice) || 599,
          rating: 5.0,
          reviewsCount: 0,
          image: finalImageUrl,
          description: description || 'High-quality professional design template.',
          features: [
            '100% Layered PSD with organized folders',
            '300 DPI CMYK Print Ready format',
            'Telugu Unicode typography compatible'
          ],
          fileFormat,
          fileSize,
          dimensions,
          dpi: Number(dpi) || 100,
          colorMode,
          filesIncluded: '1 Editable PSD + Fonts Pack',
          softwareCompatibility: 'Photoshop CS6 to CC',
          fontsIncluded: true,
          teluguFontsSupported,
          downloadsCount: 0,
          tags: [category, fileFormat, 'Telugu Banner'],
          status
        });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving product:', err);
      // Clean up orphaned upload if product creation failed
      if (uploadedFilePath) {
        await deleteProductPreview(uploadedFilePath);
      }
      showToast('Error saving product. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCat === 'all' || p.categorySlug === selectedCat;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Product Catalog Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage downloadable PSD templates, specifications, pricing, and availability.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 self-start shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add New Template</span>
          </button>
        </div>

        {/* Filters & Search Row */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or category..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Template</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Specs</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Downloads</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-slate-900 truncate">{p.title}</p>
                          <span className="text-[11px] text-slate-400">{p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {p.category}
                    </td>
                    <td className="px-5 py-3.5 text-[11px]">
                      <span className="font-semibold text-slate-800">{p.fileFormat}</span> · {p.fileSize}
                      <div className="text-slate-400">{p.dpi} DPI ({p.colorMode})</div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 tabular-nums">
                      ₹{p.price}{' '}
                      <span className="text-[11px] text-slate-400 line-through">₹{p.originalPrice}</span>
                    </td>
                    <td className="px-5 py-3.5 tabular-nums text-slate-700">
                      {p.downloadsCount}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${p.title}"?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 font-display">
                {editingProduct ? 'Edit Design Template' : 'Add New Design Template'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Template Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Royal Wedding Lagna Patrika Card PSD"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Format</label>
                  <select
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value as FileFormat)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                  >
                    <option value="PSD">PSD (Photoshop Layered)</option>
                    <option value="AI">AI (Illustrator Vector)</option>
                    <option value="CDR">CDR (CorelDraw)</option>
                    <option value="ZIP">ZIP (Multi-file Pack)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Sale Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Preview Image Upload Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-800">
                    Preview Image *
                  </label>
                  <span className="text-[11px] text-slate-500">
                    JPG, PNG or WEBP • Maximum 5 MB
                  </span>
                </div>

                {previewImageUrl ? (
                  /* Image Preview Area */
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-3">
                    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-56 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200">
                      <img
                        src={previewImageUrl}
                        alt="Template Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                      <div className="min-w-0 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-900 truncate">
                          {imageFileName || 'Selected Preview Image'}
                        </span>
                        {imageFileSizeText && (
                          <span className="text-slate-400 shrink-0">
                            • {imageFileSizeText}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 border border-slate-300 hover:bg-white text-slate-700 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Change Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty Drag & Drop / Click to Upload Box */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-amber-500 bg-amber-50/50'
                        : imageError
                        ? 'border-rose-300 bg-rose-50/30 hover:bg-rose-50/50'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-500 mb-3 shadow-xs">
                      <Upload className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-800 text-xs">
                        Upload Template Preview Image
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Drag & drop or <span className="text-amber-600 font-semibold underline">browse file</span> from computer
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      JPG, PNG or WEBP • Maximum 5 MB
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {imageError && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{imageError}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">File Size</label>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="150 MB"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">DPI</label>
                  <input
                    type="text"
                    value={dpi}
                    onChange={(e) => setDpi(e.target.value)}
                    placeholder="300"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Color Mode</label>
                  <select
                    value={colorMode}
                    onChange={(e) => setColorMode(e.target.value as 'CMYK' | 'RGB')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="CMYK">CMYK (Print)</option>
                    <option value="RGB">RGB (Digital)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Description & Print Notes
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide specifications, layers guide, and Telugu font instructions..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={teluguFontsSupported}
                    onChange={(e) => setTeluguFontsSupported(e.target.checked)}
                    className="rounded accent-slate-900"
                  />
                  <span>Includes Telugu Unicode & Anu Script Fonts</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingImage}
                    className="px-5 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 shadow-sm flex items-center gap-2 disabled:opacity-60"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Uploading Image...</span>
                      </>
                    ) : (
                      <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
