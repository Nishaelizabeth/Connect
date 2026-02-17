import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    X, 
    ListOrdered, 
    MapPin, 
    GripVertical, 
    Trash2, 
    StickyNote, 
    Plus,
    Map,
    Loader2
} from 'lucide-react';
import {
    getItinerary,
    removeFromItinerary,
    updateItineraryNotes,
    reorderItinerary,
    type ItineraryItem,
    type ReorderItem,
} from '@/api/itinerary.api';

interface ItineraryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: number;
    tripTitle: string;
}

/**
 * Slide-out drawer for trip itinerary management.
 * Shows saved destinations with drag-to-reorder, notes, and remove functionality.
 */
export const ItineraryDrawer: React.FC<ItineraryDrawerProps> = ({
    isOpen,
    onClose,
    tripId,
    tripTitle,
}) => {
    const navigate = useNavigate();
    const [items, setItems] = useState<ItineraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);
    const [editingNotesId, setEditingNotesId] = useState<number | null>(null);
    const [notesInput, setNotesInput] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);
    const [draggedItem, setDraggedItem] = useState<ItineraryItem | null>(null);

    // Load itinerary data
    const loadItinerary = useCallback(async () => {
        if (!isOpen) return;
        
        setLoading(true);
        setError(null);
        try {
            const data = await getItinerary(tripId);
            setItems(data.items);
        } catch (err: any) {
            console.error('Failed to load itinerary:', err);
            setError(err.response?.data?.detail || 'Failed to load itinerary');
        } finally {
            setLoading(false);
        }
    }, [isOpen, tripId]);

    useEffect(() => {
        loadItinerary();
    }, [loadItinerary]);

    // Handle remove item
    const handleRemove = async (itemId: number) => {
        setRemovingId(itemId);
        // Optimistic update
        const previousItems = [...items];
        setItems(items.filter(item => item.id !== itemId));
        
        try {
            await removeFromItinerary(tripId, itemId);
        } catch (err: any) {
            console.error('Failed to remove item:', err);
            // Rollback on error
            setItems(previousItems);
            setError(err.response?.data?.detail || 'Failed to remove item');
        } finally {
            setRemovingId(null);
        }
    };

    // Handle notes editing
    const handleStartEditNotes = (item: ItineraryItem) => {
        setEditingNotesId(item.id);
        setNotesInput(item.notes || '');
    };

    const handleSaveNotes = async () => {
        if (editingNotesId === null) return;
        
        setSavingNotes(true);
        try {
            const updated = await updateItineraryNotes(tripId, editingNotesId, notesInput);
            setItems(items.map(item => 
                item.id === editingNotesId ? updated : item
            ));
            setEditingNotesId(null);
            setNotesInput('');
        } catch (err: any) {
            console.error('Failed to save notes:', err);
            setError(err.response?.data?.detail || 'Failed to save notes');
        } finally {
            setSavingNotes(false);
        }
    };

    const handleCancelNotes = () => {
        setEditingNotesId(null);
        setNotesInput('');
    };

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, item: ItineraryItem) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, targetItem: ItineraryItem) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.id === targetItem.id) {
            setDraggedItem(null);
            return;
        }

        // Reorder items locally
        const newItems = [...items];
        const draggedIndex = newItems.findIndex(i => i.id === draggedItem.id);
        const targetIndex = newItems.findIndex(i => i.id === targetItem.id);
        
        newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);
        
        // Optimistic update
        setItems(newItems);
        setDraggedItem(null);

        // Send reorder to backend
        try {
            const reorderData: ReorderItem[] = newItems.map((item, index) => ({
                id: item.id,
                position: index + 1
            }));
            await reorderItinerary(tripId, reorderData);
        } catch (err: any) {
            console.error('Failed to reorder:', err);
            // Reload on error
            loadItinerary();
        }
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    // Navigate to add destinations
    const handleAddDestination = () => {
        onClose();
        navigate(`/trips/${tripId}/recommendations`);
    };

    // Navigate to map view (placeholder)
    const handleMapView = () => {
        // TODO: Implement map view
        console.log('Map view clicked');
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <ListOrdered className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900 line-clamp-1">Trip Itinerary</h2>
                            <span className="text-xs text-gray-500">
                                {items.length} destination{items.length !== 1 ? 's' : ''} saved
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Trip Info Bar */}
                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm text-gray-600 truncate">{tripTitle}</p>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {loading ? (
                        // Loading skeleton
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                                    <div className="flex gap-3">
                                        <div className="w-16 h-16 rounded-lg bg-gray-200" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-3/4 bg-gray-200 rounded" />
                                            <div className="h-3 w-1/2 bg-gray-200 rounded" />
                                            <div className="h-3 w-1/3 bg-gray-200 rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        // Error state
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <p className="text-red-500 mb-2">{error}</p>
                            <button
                                onClick={() => { setError(null); loadItinerary(); }}
                                className="text-blue-600 hover:underline text-sm"
                            >
                                Try again
                            </button>
                        </div>
                    ) : items.length === 0 ? (
                        // Empty state
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                                <ListOrdered className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="font-semibold text-gray-700 mb-2">No destinations yet</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Start building your itinerary by exploring destinations!
                            </p>
                            <button
                                onClick={handleAddDestination}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Destinations
                            </button>
                        </div>
                    ) : (
                        // Itinerary list
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, item)}
                                    onDragEnd={handleDragEnd}
                                    className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all ${
                                        draggedItem?.id === item.id ? 'opacity-50 scale-95' : ''
                                    } ${removingId === item.id ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        {/* Drag Handle */}
                                        <div className="flex flex-col items-center justify-center cursor-grab active:cursor-grabbing">
                                            <span className="text-xs font-bold text-gray-400 mb-1">{index + 1}</span>
                                            <GripVertical className="w-4 h-4 text-gray-300" />
                                        </div>

                                        {/* Image */}
                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-400 to-teal-500">
                                            {item.destination.image_url ? (
                                                <img
                                                    src={item.destination.image_url}
                                                    alt={item.destination.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <MapPin className="w-6 h-6 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                                                {item.destination.name}
                                            </h4>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate">
                                                    {item.destination.city}
                                                    {item.destination.country && `, ${item.destination.country}`}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                Added by {item.added_by_name}
                                            </p>
                                            
                                            {/* Notes display (not editing) */}
                                            {item.notes && editingNotesId !== item.id && (
                                                <p className="text-xs text-gray-600 mt-2 italic bg-gray-50 p-2 rounded">
                                                    "{item.notes}"
                                                </p>
                                            )}

                                            {/* Notes editing */}
                                            {editingNotesId === item.id && (
                                                <div className="mt-2 space-y-2">
                                                    <textarea
                                                        value={notesInput}
                                                        onChange={(e) => setNotesInput(e.target.value)}
                                                        placeholder="Add notes..."
                                                        className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                                        rows={2}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={handleSaveNotes}
                                                            disabled={savingNotes}
                                                            className="text-xs px-3 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 disabled:opacity-50"
                                                        >
                                                            {savingNotes ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={handleCancelNotes}
                                                            className="text-xs px-3 py-1 border border-gray-200 rounded font-medium hover:bg-gray-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => handleStartEditNotes(item)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Edit notes"
                                            >
                                                <StickyNote className="w-4 h-4 text-gray-400" />
                                            </button>
                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                disabled={removingId === item.id}
                                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove"
                                            >
                                                {removingId === item.id ? (
                                                    <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 bg-white space-y-2">
                    <div className="flex gap-2">
                        <button
                            onClick={handleMapView}
                            disabled={items.length === 0}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Map className="w-4 h-4" />
                            Map View
                        </button>
                        <button
                            onClick={handleAddDestination}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Destination
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ItineraryDrawer;
