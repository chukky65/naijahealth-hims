import React, { useState, useEffect } from 'react';
import { 
  Video, Mic, MicOff, VideoOff, PhoneOff, MonitorUp, 
  MessageSquare, FileText, Activity, AlertCircle, Plus,
  Send, Minimize2, Maximize2, User, Clock, CheckCircle2, FlaskConical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui/core';
import { useStore } from '../store/useStore';

export const Telemedicine = () => {
  const { user, patients, pharmacyItems, labTests, addPrescription, addLabOrder } = useStore();
  const mockPatient = patients[0] || { id: 'mock-id', name: 'Oluwaseun Adebayo' };

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'prescribe' | 'lab' | 'notes'>('chart');
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Simulated prescription form
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isPrescriptionSent, setIsPrescriptionSent] = useState(false);

  // Lab form
  const [selectedLabTestId, setSelectedLabTestId] = useState('');
  const [isLabOrderSent, setIsLabOrderSent] = useState(false);

  // Timer for the call
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medication || !dosage || !user) return;
    
    addPrescription({
      patientId: mockPatient.id,
      doctorName: user.name,
      pharmacyItemId: medication,
      dosage: dosage,
      frequency: 'As directed',
      durationDays: 3,
      quantity: quantity
    });

    setIsPrescriptionSent(true);
    setTimeout(() => {
      setMedication('');
      setDosage('');
      setQuantity(1);
      setIsPrescriptionSent(false);
    }, 3000);
  };

  const handleAddLabOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabTestId || !user) return;
    
    addLabOrder({
      patientId: mockPatient.id,
      doctorName: user.name,
      testId: selectedLabTestId
    });

    setIsLabOrderSent(true);
    setTimeout(() => {
      setSelectedLabTestId('');
      setIsLabOrderSent(false);
    }, 3000);
  };

  return (
    <div className={`flex flex-col xl:flex-row gap-6 h-[calc(100vh-8rem)] ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-6 h-screen' : ''}`}>
      
      {/* Left Column: Main Stage (Video Call) */}
      <div className={`flex-1 flex flex-col ${isFullscreen ? 'w-full' : 'xl:w-2/3'} transition-all duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`font-bold tracking-tight ${isFullscreen ? 'text-white text-3xl' : 'text-2xl text-slate-900 dark:text-white'}`}>
              Teleconsultation
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="success" className="animate-pulse">● LIVE</Badge>
              <span className={`text-sm font-medium ${isFullscreen ? 'text-slate-300' : 'text-slate-500'}`}>
                {formatDuration(callDuration)}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-2 rounded-lg transition-colors ${isFullscreen ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Video Feed Area */}
        <div className="relative flex-1 bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between group">
          {/* Main Patient Video */}
          {!isVideoOff ? (
            <img 
              src="/images/telemedicine_patient.png" 
              alt="Patient Video Feed"
              className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400">
              <User className="w-24 h-24 mb-4 opacity-50" />
              <p>Patient Video Paused</p>
            </div>
          )}

          {/* Self View (Doctor PIP) */}
          <div className="absolute bottom-24 right-6 w-48 h-32 bg-slate-800 rounded-xl border-2 border-slate-700 overflow-hidden shadow-xl z-20 transition-transform duration-300 group-hover:scale-105">
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-900">
              <Video className="w-8 h-8 opacity-50" />
            </div>
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-medium text-white backdrop-blur-sm">
              You (Dr. Smith)
            </div>
          </div>

          {/* Patient Info Overlay */}
          <div className="absolute top-6 left-6 z-20">
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-white shadow-lg border border-white/10">
              <h2 className="font-semibold">Oluwaseun Adebayo</h2>
              <p className="text-xs text-slate-300">ID: PT-2023-0892 • Male • 45 Yrs</p>
            </div>
          </div>

          {/* Call Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-2xl border border-white/10 z-30 transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
              title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
            <button 
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-4 rounded-full transition-all ${isScreenSharing ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
              title="Share Screen"
            >
              <MonitorUp className="w-6 h-6" />
            </button>
            <div className="w-px h-8 bg-slate-600 mx-2"></div>
            <button 
              className="p-4 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 hover:scale-110 transition-all"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Clinical Workspace */}
      {!isFullscreen && (
        <div className="w-full xl:w-1/3 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 p-2 gap-2 bg-slate-50 dark:bg-slate-900/50">
            <button 
              onClick={() => setActiveTab('chart')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'chart' ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Activity className="w-4 h-4" /> Chart
            </button>
            <button 
              onClick={() => setActiveTab('prescribe')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'prescribe' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Plus className="w-4 h-4" /> Prescribe
            </button>
            <button 
              onClick={() => setActiveTab('lab')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'lab' ? 'bg-white dark:bg-slate-800 text-fuchsia-600 dark:text-fuchsia-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <FlaskConical className="w-4 h-4" /> Lab
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'notes' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <FileText className="w-4 h-4" /> Notes
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950/20">
            
            {/* Chart Tab */}
            {activeTab === 'chart' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-500" /> Recent Vitals
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="text-xs text-slate-500 mb-1">Blood Pressure</div>
                      <div className="font-mono font-bold text-lg text-slate-900 dark:text-white">130/85 <span className="text-xs font-sans text-slate-400 font-normal">mmHg</span></div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="text-xs text-slate-500 mb-1">Heart Rate</div>
                      <div className="font-mono font-bold text-lg text-slate-900 dark:text-white">88 <span className="text-xs font-sans text-slate-400 font-normal">bpm</span></div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="text-xs text-slate-500 mb-1">Temperature</div>
                      <div className="font-mono font-bold text-lg text-amber-500">38.2 <span className="text-xs font-sans text-slate-400 font-normal">°C</span></div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="text-xs text-slate-500 mb-1">Weight</div>
                      <div className="font-mono font-bold text-lg text-slate-900 dark:text-white">82 <span className="text-xs font-sans text-slate-400 font-normal">kg</span></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Allergies</h3>
                  <div className="flex gap-2">
                    <Badge variant="danger" className="px-3 py-1 bg-red-100 text-red-700 border-red-200">Penicillin</Badge>
                    <Badge variant="warning" className="px-3 py-1">Pollen</Badge>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Previous Diagnosis</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400/80 mt-1">Patient was treated for uncomplicated malaria 3 weeks ago. Complaining of returning fever.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Prescribe Tab */}
            {activeTab === 'prescribe' && (
              <div className="h-full flex flex-col animate-in slide-in-from-right-4 fade-in duration-300">
                <form onSubmit={handleSendPrescription} className="flex-1 flex flex-col space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Medication Name</label>
                    <select 
                      value={medication}
                      onChange={(e) => setMedication(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                      required
                    >
                      <option value="">Select Medication...</option>
                      {pharmacyItems.filter(item => item.stockLevel > 0).map(item => (
                        <option key={item.id} value={item.id}>{item.name} ({item.stockLevel} in stock)</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dosage & Frequency</label>
                      <input 
                        type="text" 
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        placeholder="e.g. 80/480mg PO BID"
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity (Packs)</label>
                      <input 
                        type="number" min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pharmacy Instructions</label>
                    <textarea 
                      placeholder="Optional notes for the pharmacist..."
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-shadow h-24"
                    />
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button 
                      type="submit"
                      disabled={isPrescriptionSent}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-medium shadow-md transition-all ${
                        isPrescriptionSent 
                          ? 'bg-emerald-500 hover:bg-emerald-600 cursor-default' 
                          : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
                      }`}
                    >
                      {isPrescriptionSent ? (
                        <><CheckCircle2 className="w-5 h-5" /> Sent to Pharmacy</>
                      ) : (
                        <><Send className="w-5 h-5" /> Send Prescription</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lab Tab */}
            {activeTab === 'lab' && (
              <div className="h-full flex flex-col animate-in slide-in-from-right-4 fade-in duration-300">
                <form onSubmit={handleAddLabOrder} className="flex-1 flex flex-col space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Laboratory/Radiology Test</label>
                    <select 
                      value={selectedLabTestId}
                      onChange={(e) => setSelectedLabTestId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-fuchsia-500 outline-none transition-shadow"
                      required
                    >
                      <option value="">Select a test...</option>
                      {labTests.map(test => (
                        <option key={test.id} value={test.id}>{test.name} - ₦{test.price.toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button 
                      type="submit"
                      disabled={isLabOrderSent || !selectedLabTestId}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-medium shadow-md transition-all ${
                        isLabOrderSent 
                          ? 'bg-emerald-500 hover:bg-emerald-600 cursor-default' 
                          : 'bg-fuchsia-600 hover:bg-fuchsia-700 hover:shadow-lg disabled:opacity-50'
                      }`}
                    >
                      {isLabOrderSent ? (
                        <><CheckCircle2 className="w-5 h-5" /> Test Ordered</>
                      ) : (
                        <><FlaskConical className="w-5 h-5" /> Order Test</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="h-full flex flex-col animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col shadow-inner">
                  <div className="bg-slate-100 dark:bg-slate-900 p-2 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
                    <button className="px-2 py-1 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded shadow-sm">SOAP Note</button>
                    <button className="px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors">Free Text</button>
                    <div className="ml-auto px-2 py-1 flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" /> Auto-saving
                    </div>
                  </div>
                  <textarea 
                    placeholder="S: Patient complains of recurring fever and chills starting 2 days ago...&#10;&#10;O: Temp 38.2C...&#10;&#10;A: Possible treatment failure or reinfection of Malaria...&#10;&#10;P: Prescribe ACT, order repeat RDT..."
                    className="flex-1 w-full p-4 bg-transparent outline-none resize-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                    Save to Chart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
