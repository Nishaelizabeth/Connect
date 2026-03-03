import React, { useState } from 'react';
import { X, Plus, Trash2, BarChart3, ToggleLeft, ToggleRight } from 'lucide-react';

interface CreatePollModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { question: string; options: string[]; allow_multiple: boolean }) => Promise<void>;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const handleAddOption = () => {
        if (options.length < 10) {
            setOptions(prev => [...prev, '']);
        }
    };

    const handleRemoveOption = (index: number) => {
        if (options.length > 2) {
            setOptions(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        setOptions(prev => prev.map((opt, i) => (i === index ? value : opt)));
        setErrors([]);
    };

    const validate = (): boolean => {
        const newErrors: string[] = [];
        if (!question.trim()) newErrors.push('Question is required.');
        const filledOptions = options.filter(o => o.trim());
        if (filledOptions.length < 2) newErrors.push('At least 2 options are required.');
        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                question: question.trim(),
                options: options.filter(o => o.trim()),
                allow_multiple: allowMultiple,
            });
            // Reset on success
            setQuestion('');
            setOptions(['', '']);
            setAllowMultiple(false);
            setErrors([]);
            onClose();
        } catch {
            setErrors(['Failed to create poll. Please try again.']);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setQuestion('');
        setOptions(['', '']);
        setAllowMultiple(false);
        setErrors([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <BarChart3 className="w-4 h-4 text-blue-600" />
                            </div>
                            <h2 className="font-semibold text-gray-900 text-base">Create Poll</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                            disabled={isSubmitting}
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                        {/* Question */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                Question
                            </label>
                            <textarea
                                value={question}
                                onChange={e => { setQuestion(e.target.value); setErrors([]); }}
                                placeholder="Ask the group something..."
                                rows={2}
                                maxLength={500}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                            />
                            <p className="text-[10px] text-gray-400 text-right mt-1">
                                {question.length}/500
                            </p>
                        </div>

                        {/* Options */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                Options
                            </label>
                            <div className="space-y-2">
                                {options.map((option, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-500 flex-shrink-0">
                                            {index + 1}
                                        </span>
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={e => handleOptionChange(index, e.target.value)}
                                            placeholder={`Option ${index + 1}`}
                                            maxLength={200}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                                        />
                                        {options.length > 2 && (
                                            <button
                                                onClick={() => handleRemoveOption(index)}
                                                className="p-1 hover:bg-red-50 rounded-md transition-colors text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {options.length < 10 && (
                                <button
                                    onClick={handleAddOption}
                                    className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium px-1 py-1"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add option
                                </button>
                            )}
                        </div>

                        {/* Multiple choice toggle */}
                        <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="text-sm font-medium text-gray-800">Multiple choice</p>
                                <p className="text-xs text-gray-500">Members can select more than one option</p>
                            </div>
                            <button
                                onClick={() => setAllowMultiple(prev => !prev)}
                                className="flex-shrink-0 ml-3"
                            >
                                {allowMultiple ? (
                                    <ToggleRight className="w-8 h-8 text-blue-600" />
                                ) : (
                                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                                )}
                            </button>
                        </div>

                        {/* Errors */}
                        {errors.length > 0 && (
                            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                                {errors.map((err, i) => (
                                    <p key={i} className="text-xs text-red-600">{err}</p>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-3 p-5 pt-0">
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !question.trim() || options.filter(o => o.trim()).length < 2}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Poll'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreatePollModal;
