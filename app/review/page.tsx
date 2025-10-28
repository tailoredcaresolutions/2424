
'use client'

import { useState } from 'react'

export default function ReviewPage() {
  const [activeTab, setActiveTab] = useState<'paragraph' | 'json'>('paragraph')
  const [paragraphReport, setParagraphReport] = useState(`Patient John Doe presented with acute chest pain radiating to the left arm. Initial assessment revealed elevated troponin levels and ECG changes consistent with myocardial infarction. Patient was immediately started on dual antiplatelet therapy and prepared for emergency cardiac catheterization.

The procedure revealed 90% occlusion of the left anterior descending artery. Successful percutaneous coronary intervention was performed with drug-eluting stent placement. Post-procedure, patient remained hemodynamically stable with resolution of chest pain.

Patient will continue on optimal medical therapy including aspirin, clopidogrel, atorvastatin, and metoprolol. Follow-up echocardiogram scheduled in 6 weeks to assess left ventricular function recovery.`)

  const [jsonReport, setJsonReport] = useState(`{
  "patient": {
    "name": "John Doe",
    "age": 58,
    "gender": "Male",
    "mrn": "12345678"
  },
  "data": {
    "chief_complaint": "Acute chest pain",
    "vital_signs": {
      "bp": "140/90",
      "hr": 95,
      "temp": "98.6°F",
      "spo2": "98%"
    },
    "labs": {
      "troponin": "elevated",
      "ck_mb": "elevated"
    }
  },
  "assessment": {
    "primary_diagnosis": "ST-elevation myocardial infarction",
    "procedures": ["Cardiac catheterization", "PCI with stent"]
  },
  "response": {
    "treatment_outcome": "Successful revascularization",
    "complications": "None",
    "discharge_plan": "Optimal medical therapy"
  }
}`)

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${type} copied to clipboard`)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleEdit = () => {
    alert('Edit functionality would open editor')
  }

  const handleSave = () => {
    alert('Report saved successfully')
  }

  const handleExport = () => {
    alert('Export functionality would download file')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Review Report</h1>
          <p className="text-slate-600">Review and manage your clinical report</p>
        </header>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-slate-200">
            <nav className="flex" role="tablist" aria-label="Report tabs">
              <button
                role="tab"
                aria-selected={activeTab === 'paragraph'}
                aria-controls="paragraph-panel"
                id="paragraph-tab"
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'paragraph'
                    ? 'border-amber-500 text-amber-600 bg-amber-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
                onClick={() => setActiveTab('paragraph')}
              >
                Paragraph Report
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'json'}
                aria-controls="json-panel"
                id="json-tab"
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'json'
                    ? 'border-amber-500 text-amber-600 bg-amber-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
                onClick={() => setActiveTab('json')}
              >
                DAR JSON
              </button>
            </nav>
          </div>

          <div className="p-6">
            <div
              role="tabpanel"
              id="paragraph-panel"
              aria-labelledby="paragraph-tab"
              className={activeTab === 'paragraph' ? 'block' : 'hidden'}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Paragraph Report</h2>
                <button
                  onClick={() => copyToClipboard(paragraphReport, 'Paragraph report')}
                  aria-label="Copy paragraph report to clipboard"
                  className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                  Copy
                </button>
              </div>
              <div className="bg-slate-50 rounded-lg p-6 border">
                <pre className="whitespace-pre-wrap text-slate-700 leading-relaxed font-sans">
                  {paragraphReport}
                </pre>
              </div>
            </div>

            <div
              role="tabpanel"
              id="json-panel"
              aria-labelledby="json-tab"
              className={activeTab === 'json' ? 'block' : 'hidden'}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800">DAR JSON</h2>
                <button
                  onClick={() => copyToClipboard(jsonReport, 'JSON report')}
                  aria-label="Copy JSON report to clipboard"
                  className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                  Copy
                </button>
              </div>
              <div className="bg-slate-50 rounded-lg p-6 border">
                <pre className="whitespace-pre-wrap text-slate-700 text-sm font-mono overflow-x-auto">
                  {jsonReport}
                </pre>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleEdit}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition-colors font-medium"
              >
                Edit
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors font-medium"
              >
                Save
              </button>
              <button
                onClick={handleExport}
                className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-medium"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

