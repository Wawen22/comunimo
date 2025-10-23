'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { supabase } from '@/lib/api/supabase';
import {
  parseCSVFile,
  downloadCSVTemplate,
  type ParsedCSVRow,
  type CSVParseResult,
} from '@/lib/utils/csvImport';
import {
  Upload,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';

interface BulkImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 1 | 2 | 3;

export function BulkImportDialog({ isOpen, onClose, onSuccess }: BulkImportDialogProps) {
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: number;
    total: number;
  } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Errore',
        description: 'Seleziona un file CSV',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const result = await parseCSVFile(selectedFile);
      setParseResult(result);
      setStep(2);
    } catch (error: any) {
      console.error('Error parsing CSV:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile leggere il file CSV',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!parseResult) return;

    setIsProcessing(true);
    setStep(3);
    setImportProgress(0);

    const validRows = parseResult.rows.filter(row => row.isValid);
    let successCount = 0;
    let errorCount = 0;

    // Import in batches of 10
    const batchSize = 10;
    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);
      
      for (const row of batch) {
        try {
          // First, get society_id from society_code
          const { data: society, error: societyError } = await supabase
            .from('societies')
            .select('id')
            .eq('society_code', row.data.society_code || '')
            .eq('is_active', true)
            .single() as { data: { id: string } | null; error: any };

          if (societyError || !society) {
            console.error(`Society not found for code: ${row.data.society_code}`);
            errorCount++;
            continue;
          }

          // Prepare member data
          const memberData = {
            first_name: row.data.first_name,
            last_name: row.data.last_name,
            fiscal_code: row.data.fiscal_code || null,
            birth_date: row.data.birth_date,
            gender: row.data.gender,
            email: row.data.email || null,
            phone: row.data.phone || null,
            address: row.data.address || null,
            city: row.data.city || null,
            postal_code: row.data.postal_code || null,
            province: row.data.province || null,
            society_id: society.id,
            society_code: row.data.society_code,
            organization: row.data.organization,
            category: row.data.category || null,
            membership_status: row.data.membership_status || 'active',
            medical_certificate_date: row.data.medical_certificate_date || null,
            medical_certificate_expiry: row.data.medical_certificate_expiry || null,
            is_foreign: row.data.is_foreign === 'true',
            notes: row.data.notes || null,
            is_active: true,
          };

          // Insert member
          const { error: insertError } = await supabase
            .from('members')
            .insert(memberData as any);

          if (insertError) {
            console.error('Error inserting member:', insertError);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error: any) {
          console.error('Error processing row:', error);
          errorCount++;
        }
      }

      // Update progress
      setImportProgress(Math.round(((i + batch.length) / validRows.length) * 100));
    }

    setImportResult({
      success: successCount,
      errors: errorCount,
      total: validRows.length,
    });

    setIsProcessing(false);

    if (successCount > 0) {
      toast({
        title: 'Import completato',
        description: `${successCount} atleti importati con successo`,
        variant: 'default',
      });
      onSuccess();
    }
  };

  const handleClose = () => {
    setStep(1);
    setFile(null);
    setParseResult(null);
    setImportProgress(0);
    setImportResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Import Massivo Atleti
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Upload File</span>
            </div>
            <div className="flex-1 mx-4 h-1 bg-gray-200">
              <div className={`h-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ width: step >= 2 ? '100%' : '0%' }} />
            </div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Validazione</span>
            </div>
            <div className="flex-1 mx-4 h-1 bg-gray-200">
              <div className={`h-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ width: step >= 3 ? '100%' : '0%' }} />
            </div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Import</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Carica file CSV
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Seleziona un file CSV con i dati degli atleti da importare.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Seleziona file CSV
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isProcessing}
                  />
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  File CSV con encoding UTF-8
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                      Non hai un file CSV?
                    </h4>
                    <p className="text-sm text-blue-700 mb-2">
                      Scarica il template CSV di esempio e compilalo con i tuoi dati.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadCSVTemplate}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Scarica Template
                    </Button>
                  </div>
                </div>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Analisi file in corso...</span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Validation */}
          {step === 2 && parseResult && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Risultati Validazione
                </h3>
                <p className="text-sm text-gray-600">
                  File: <span className="font-medium">{file?.name}</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{parseResult.totalCount}</div>
                  <div className="text-sm text-gray-600">Righe Totali</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{parseResult.validCount}</div>
                  <div className="text-sm text-green-700">Valide</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{parseResult.errorCount}</div>
                  <div className="text-sm text-red-700">Errori</div>
                </div>
              </div>

              {parseResult.errorCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <h4 className="text-sm font-medium text-red-900 mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Errori di Validazione
                  </h4>
                  <div className="space-y-2">
                    {parseResult.rows
                      .filter(row => !row.isValid)
                      .slice(0, 10)
                      .map((row, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-red-800">Riga {row.rowNumber}:</span>
                          <ul className="ml-4 mt-1 list-disc list-inside text-red-700">
                            {row.errors.map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    {parseResult.rows.filter(row => !row.isValid).length > 10 && (
                      <p className="text-sm text-red-600 italic">
                        ... e altri {parseResult.rows.filter(row => !row.isValid).length - 10} errori
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Import Progress */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isProcessing ? 'Import in corso...' : 'Import completato'}
                </h3>
              </div>

              {isProcessing && (
                <div className="space-y-4">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-600">
                    {importProgress}% completato
                  </p>
                </div>
              )}

              {!isProcessing && importResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">{importResult.total}</div>
                      <div className="text-sm text-gray-600">Totale</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                      <div className="text-sm text-green-700">Importati</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">{importResult.errors}</div>
                      <div className="text-sm text-red-700">Falliti</div>
                    </div>
                  </div>

                  {importResult.success > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-900">
                          {importResult.success} atleti importati con successo!
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            {step === 3 && !isProcessing ? 'Chiudi' : 'Annulla'}
          </Button>
          
          {step === 2 && parseResult && (
            <Button
              onClick={handleImport}
              disabled={isProcessing || parseResult.validCount === 0}
            >
              Importa {parseResult.validCount} Atleti
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

