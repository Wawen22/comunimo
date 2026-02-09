'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import {
  parseFIDALExcel,
  parseUISPExcel,
  upsertMemberFromFIDAL,
  upsertMemberFromUISP,
  type ParsedFIDALData,
  type ParsedUISPData,
  type ImportResult,
} from '@/lib/utils/excelImport';
import { logAuditEvent } from '@/lib/utils/auditLogger';

interface BulkImportExcelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ImportType = 'FIDAL' | 'UISP' | null;
type Step = 1 | 2 | 3 | 4 | 5;

export function BulkImportExcelDialog({
  isOpen,
  onClose,
  onSuccess,
}: BulkImportExcelDialogProps) {
  const [step, setStep] = useState<Step>(1);
  const [importType, setImportType] = useState<ImportType>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedFIDALData[] | ParsedUISPData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  const validCount = parsedData.filter(d => d.isValid).length;
  const errorCount = parsedData.filter(d => !d.isValid).length;

  const handleReset = () => {
    setStep(1);
    setImportType(null);
    setFile(null);
    setParsedData([]);
    setIsProcessing(false);
    setProgress(0);
    setResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSelectType = (type: ImportType) => {
    setImportType(type);
    setStep(2);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    console.log('📁 File selected:', selectedFile.name, 'Type:', importType);

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      if (importType === 'FIDAL') {
        console.log('🚀 Starting FIDAL parsing...');
        const parsed = await parseFIDALExcel(selectedFile);
        console.log('✅ Parsing complete, data:', parsed);
        setParsedData(parsed);
        setStep(3);
      } else if (importType === 'UISP') {
        console.log('🚀 Starting UISP parsing...');
        const parsed = await parseUISPExcel(selectedFile);
        console.log('✅ Parsing complete, data:', parsed);
        setParsedData(parsed);
        setStep(3);
      }
    } catch (error) {
      console.error('❌ Error parsing file:', error);
      alert('Errore durante il parsing del file. Verifica il formato.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    setStep(4);
    setIsProcessing(true);

    const validData = parsedData.filter(d => d.isValid);
    const importResult: ImportResult = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      errorDetails: [],
    };

    for (const [index, item] of validData.entries()) {
      try {
        // Use appropriate upsert function based on import type
        const result = importType === 'FIDAL'
          ? await upsertMemberFromFIDAL(item.data)
          : await upsertMemberFromUISP(item.data);

        if (result.success) {
          if (result.action === 'inserted') {
            importResult.inserted++;
          } else if (result.action === 'updated') {
            importResult.updated++;
          } else if (result.action === 'skipped') {
            importResult.skipped++;
          }
        } else {
          importResult.errors++;
          importResult.errorDetails.push({
            row: item.rowNumber,
            message: result.error || 'Errore sconosciuto',
          });
        }
      } catch (error: any) {
        importResult.errors++;
        importResult.errorDetails.push({
          row: item.rowNumber,
          message: error.message || 'Errore sconosciuto',
        });
      }

      // Update progress
      setProgress(Math.round(((index + 1) / validData.length) * 100));
    }

    setResult(importResult);

    // Log audit event
    const totalImported = importResult.inserted + importResult.updated;
    if (totalImported > 0) {
      await logAuditEvent({
        action: 'bulk_import_excel',
        resourceType: 'members',
        resourceLabel: `Import ${importType} - ${totalImported} atleti`,
        payload: {
          import_type: importType,
          file_name: file?.name,
          total_rows: parsedData.length,
          valid_rows: validData.length,
          inserted: importResult.inserted,
          updated: importResult.updated,
          skipped: importResult.skipped,
          errors: importResult.errors,
        },
      });
    }

    setIsProcessing(false);
    setStep(5);
  };

  const handleFinish = () => {
    onSuccess();
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Massivo Atleti da Excel</DialogTitle>
          <DialogDescription>
            Importa atleti da file Excel FIDAL o UISP
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Select Import Type */}
        {step === 1 && (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Seleziona Tipo Import</h3>
              <p className="text-sm text-muted-foreground">
                Scegli il formato del file Excel da importare
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-3 hover:border-primary hover:bg-primary/5"
                onClick={() => handleSelectType('FIDAL')}
              >
                <FileSpreadsheet className="h-12 w-12 text-primary" />
                <div>
                  <div className="font-semibold">Import FIDAL</div>
                  <div className="text-xs text-muted-foreground">24 colonne</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-32 flex flex-col gap-3 hover:border-primary hover:bg-primary/5"
                onClick={() => handleSelectType('UISP')}
              >
                <FileSpreadsheet className="h-12 w-12 text-primary" />
                <div>
                  <div className="font-semibold">Import UISP</div>
                  <div className="text-xs text-muted-foreground">40 colonne</div>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Upload Excel */}
        {step === 2 && (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                Carica File Excel {importType}
              </h3>
              <p className="text-sm text-muted-foreground">
                Seleziona il file Excel da importare
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={isProcessing}
                className="max-w-md mx-auto"
              />
              <p className="text-sm text-muted-foreground mt-4">
                Formato atteso: File Excel (.xlsx, .xls)
              </p>
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Parsing file...</span>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Indietro
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Validation */}
        {step === 3 && (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Anteprima Dati</h3>
              <p className="text-sm text-muted-foreground">
                Verifica i dati prima dell'import
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{parsedData.length}</div>
                <div className="text-sm text-blue-600">Totale Righe</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{validCount}</div>
                <div className="text-sm text-green-600">Validi</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-red-600">Errori</div>
              </div>
            </div>

            {/* Preview Table */}
            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Riga</th>
                    <th className="px-4 py-2 text-left">Tessera</th>
                    <th className="px-4 py-2 text-left">Cognome</th>
                    <th className="px-4 py-2 text-left">Nome</th>
                    <th className="px-4 py-2 text-left">Società</th>
                    <th className="px-4 py-2 text-left">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 50).map((item) => (
                    <tr key={item.rowNumber} className={!item.isValid ? 'bg-red-50' : ''}>
                      <td className="px-4 py-2">{item.rowNumber}</td>
                      <td className="px-4 py-2">{item.data.membership_number || '-'}</td>
                      <td className="px-4 py-2">{item.data.last_name || '-'}</td>
                      <td className="px-4 py-2">{item.data.first_name || '-'}</td>
                      <td className="px-4 py-2">{item.data.society_code || '-'}</td>
                      <td className="px-4 py-2">
                        {item.isValid ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            OK
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Errore
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parsedData.length > 50 && (
              <p className="text-sm text-muted-foreground text-center">
                Mostrate prime 50 righe di {parsedData.length}
              </p>
            )}

            {/* Error Details */}
            {errorCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-600">Errori di Validazione</h4>
                </div>
                <div className="space-y-1 text-sm text-red-600 max-h-32 overflow-y-auto">
                  {parsedData
                    .filter(d => !d.isValid)
                    .slice(0, 10)
                    .map(item => (
                      <div key={item.rowNumber}>
                        Riga {item.rowNumber}: {item.errors.join(', ')}
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Indietro
              </Button>
              <Button
                onClick={handleImport}
                disabled={validCount === 0}
              >
                Conferma Import ({validCount} atleti)
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Import Progress */}
        {step === 4 && (
          <div className="space-y-6 py-12">
            <div className="text-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Import in Corso...</h3>
              <p className="text-sm text-muted-foreground">
                Attendere il completamento dell'operazione
              </p>
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-center text-sm font-medium">{progress}% completato</p>
            </div>
          </div>
        )}

        {/* Step 5: Final Report */}
        {step === 5 && result && (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Import Completato!</h3>
              <p className="text-sm text-muted-foreground">
                Riepilogo dell'operazione
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{result.inserted}</div>
                <div className="text-sm text-green-600">Inseriti</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{result.updated}</div>
                <div className="text-sm text-blue-600">Aggiornati</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{result.skipped}</div>
                <div className="text-sm text-yellow-600">Saltati</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{result.errors}</div>
                <div className="text-sm text-red-600">Errori</div>
              </div>
            </div>

            {/* Error Details */}
            {result.errorDetails.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <h4 className="font-semibold text-red-600 mb-2">Dettaglio Errori:</h4>
                <ul className="space-y-1 text-sm text-red-600">
                  {result.errorDetails.map((err, idx) => (
                    <li key={idx}>
                      Riga {err.row}: {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center">
              <Button onClick={handleFinish} size="lg">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Chiudi
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
