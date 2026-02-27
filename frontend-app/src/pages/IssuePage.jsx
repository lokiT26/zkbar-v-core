import React, { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function IssuePage() {
    const [formData, setFormData] = useState({
        studentId: '',
        did: '',
        degreeName: '',
        gpa: '',
        graduationYear: '',
        originalHash: '',
        status: 'ISSUED'
    });
    const [file, setFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const calculateHash = async (fileObj) => {
        try {
            const arrayBuffer = await fileObj.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return "0x" + hashHex;
        } catch (error) {
            console.error("Error calculating hash:", error);
            return "";
        }
    };

    const handleFileProcess = async (fileObj) => {
        setFile(fileObj);
        const hash = await calculateHash(fileObj);
        setFormData(prev => ({ ...prev, originalHash: hash }));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileProcess(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileProcess(e.target.files[0]);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLookupDid = async () => {
        if (!formData.studentId) return;
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3000/api/did/${formData.studentId}`);
            if (res.data.success) {
                setFormData(prev => ({ ...prev, did: res.data.did }));
                setError(null);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch DID. Student might not be registered.");
            setFormData(prev => ({ ...prev, did: '' }));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please attach a PDF document.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        const data = new FormData();
        data.append('file', file);
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        try {
            // Connect to the backend API we built
            const res = await axios.post('http://localhost:3000/api/issue', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(res.data);
            // Reset form
            setFormData({ studentId: '', did: '', degreeName: '', gpa: '', graduationYear: '', originalHash: '', status: 'ISSUED' });
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.error || err.message || "Failed to issue credential");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Issue Academic Credential</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Upload a student's record. It will be anchored on Polygon zkEVM and stored on IPFS.
            </p>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                        <label className="form-label">Student ID</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input name="studentId" value={formData.studentId} onChange={handleChange} className="form-input" placeholder="e.g. STUDENT_123" required style={{ flex: 1 }} />
                            <button type="button" onClick={handleLookupDid} className="action-button" style={{ width: 'auto', padding: '0 1rem', background: 'var(--bg-panel)' }}>Look Up</button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Decentralized ID (DID)</label>
                        <input name="did" value={formData.did} className="form-input" placeholder="did:zkbar:... (Auto-filled)" readOnly required style={{ background: 'rgba(255,255,255,0.05)' }} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Degree Name</label>
                        <input name="degreeName" value={formData.degreeName} onChange={handleChange} className="form-input" placeholder="B.Sc Computer Science" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">GPA</label>
                        <input type="number" step="0.01" name="gpa" value={formData.gpa} onChange={handleChange} className="form-input" placeholder="4.0" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Graduation Year</label>
                        <input name="graduationYear" value={formData.graduationYear} onChange={handleChange} className="form-input" placeholder="2024" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Original Document Hash</label>
                        <input name="originalHash" value={formData.originalHash} className="form-input" placeholder="Auto-calculated on upload" readOnly required style={{ background: 'rgba(255,255,255,0.05)' }} />
                    </div>
                </div>

                <div
                    className="file-drop-area"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                >
                    <UploadCloud className="file-icon" />
                    <div>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Click to upload</span> or drag and drop
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>PDF or JSON (max 10MB)</div>
                    </div>
                    {file && (
                        <div style={{ background: 'rgba(58, 141, 255, 0.1)', color: 'var(--accent-primary)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 500 }}>
                            {file.name}
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="file-hidden-input"
                        accept="application/pdf,application/json,.pdf,.json"
                    />
                </div>

                <button type="submit" className="action-button" disabled={loading}>
                    {loading ? <><div className="spinner"></div> Processing...</> : 'Issue Credential'}
                </button>
            </form>

            {error && (
                <div className="status-card error">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <AlertCircle size={20} /> Error issuing credential
                    </div>
                    <div style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>{error}</div>
                </div>
            )}

            {success && (
                <div className="status-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <CheckCircle size={20} /> Success!
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                        {success.message}
                    </div>
                    {success.evmAnchor && !success.evmAnchor.skipped && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', background: 'rgba(58, 141, 255, 0.1)', color: 'var(--accent-primary)', padding: '0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                            <strong>Polygon zkEVM Anchor TX:</strong> <br />
                            {success.evmAnchor.txnHash}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
