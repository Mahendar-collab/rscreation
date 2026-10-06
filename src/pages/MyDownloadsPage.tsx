import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  FolderDown,
  Layers,
  ArrowLeft,
  Key,
  CheckCircle,
  HelpCircle,
  FileCheck,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { requestDownloadUrl } from '../lib/paymentService';

export const MyDownloadsPage: React.FC = () => {
  const { user, products, orders, triggerDownload, downloadProgress, showToast } = useStore();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadStats, setDownloadStats] = useState<Record<string, { remaining: number | string; total: number | string; licenseKey: string }>>({});

  // 1. Gather all purchased product IDs from user profile and completed orders
  const completedOrderItems: any[] = [];
  orders
    .filter((o) => o.status === 'Completed' || o.status === 'paid')
    .forEach((ord) => {
      ord.items?.forEach((item) => {
        completedOrderItems.push({
          ...item,
          orderId: ord.id,
          orderNumber: ord.orderNumber,
        });
      });
    });

  const purchasedIds = new Set<string>([
    ...(user?.purchasedProductIds || []),
    ...completedOrderItems.map((i) => i.productId),
  ]);

  // Purchased products list
  const downloadableProducts = products.filter((p) => purchasedIds.has(p.id));

  const handleStartDownload = async (prodId: string, orderItemId?: string) => {
    setDownloadingId(prodId);
    showToast('Validating license and generating secure signed download URL...');

    try {
      // 1. Call generate-download-url Supabase Edge Function
      const downloadRes = await requestDownloadUrl(orderItemId || '', prodId, user?.email);

      if (downloadRes.licenseKey) {
        setDownloadStats((prev) => ({
          ...prev,
          [prodId]: {
            remaining: downloadRes.remainingDownloads ?? 14,
            total: downloadRes.totalAllowedDownloads ?? 15,
            licenseKey: downloadRes.licenseKey || `RSC-LIC-${prodId.substring(0, 8).toUpperCase()}`,
          },
        }));
      }

      // If physical signed download URL is provided from Supabase Storage
      if (downloadRes.downloadUrl) {
        window.open(downloadRes.downloadUrl, '_blank');
        showToast('Download started via secure signed URL!');
      } else {
        // Fallback file with license and fonts kit
        await triggerDownload(prodId);
      }
    } catch (err: any) {
      console.warn('Download error:', err);
      await triggerDownload(prodId);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/dashboard" className="hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>My Dashboard</span>
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-semibold text-slate-800">My Downloads</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            My Digital Downloads
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access your purchased PSD files, Telugu font packs, and vector assets. Lifetime unlimited access.
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
          <span className="font-semibold text-amber-900">License:</span> Commercial Single Studio Rights
        </div>
      </div>

      {downloadableProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <FolderDown className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Downloads Available</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you purchase design resources, your direct download links will appear here immediately.
          </p>
          <Link
            to="/shop"
            className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold inline-block"
          >
            Browse PSD Templates
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {downloadableProducts.map((prod) => {
            const progress = downloadProgress[prod.id] || 0;
            const isCurrentlyDownloading = downloadingId === prod.id && progress < 100;

            return (
              <div
                key={prod.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="flex gap-4 items-start">
                  <img
                    src={prod.image}
                    alt={prod.title}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {prod.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mt-1">
                      {prod.title}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1">
                      {prod.fileFormat} · {prod.fileSize} · {prod.dpi} DPI CMYK
                    </div>
                  </div>
                </div>

                {/* File details & license */}
                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-200/60">
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      <span>Studio License Key:</span>
                    </span>
                    <span className="font-mono text-slate-800 font-semibold">
                      {downloadStats[prod.id]?.licenseKey || `RSC-LIC-${prod.id.replace('prod-', '').substring(0, 8).toUpperCase()}92X`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Download Access:</span>
                    <span className="text-emerald-700 font-medium">
                      Unlimited Lifetime Access
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Telugu Fonts Included:</span>
                    <span className="text-emerald-700 font-medium">Yes (Unicode + Anu)</span>
                  </div>
                </div>

                {/* Download Progress Bar */}
                {isCurrentlyDownloading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Downloading ZIP Archive...</span>
                      <span className="tabular-nums font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action button */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleStartDownload(prod.id)}
                    disabled={isCurrentlyDownloading}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs ${
                      progress === 100
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    } disabled:opacity-60`}
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isCurrentlyDownloading
                        ? 'Preparing File...'
                        : progress === 100
                        ? 'Re-Download Package'
                        : `Download PSD (${prod.fileSize})`}
                    </span>
                  </button>

                  <Link
                    to={`/product/${prod.id}`}
                    className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
                    title="View original product"
                  >
                    <FileCheck className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guide Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>How to use your downloaded PSD templates</span>
        </h4>
        <ol className="list-decimal pl-5 space-y-1 text-slate-600 leading-relaxed">
          <li>Extract the downloaded archive using WinRAR or 7-Zip.</li>
          <li>Install the provided Telugu Unicode and Anu Script fonts before opening Photoshop.</li>
          <li>Open the .PSD file in Adobe Photoshop CS6, CC 2018 or newer version.</li>
          <li>Double click on Smart Object layers to replace photos, and edit text layers freely.</li>
        </ol>
      </div>
    </div>
  );
};
