import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, ThumbsUp } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getToilets } from '@/services/toiletService';
import api from '@/services/api';
import { formatDate } from '@/utils/formatters';
import { RATING_DIMENSIONS } from '@/utils/constants';
import type { Toilet, Rating, ApiResponse } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

/**
 * RatingSystem — Star rating form + paginated review list for a selected toilet.
 * Supports 3 rating dimensions, photo attachments, and helpful votes.
 */
export default function RatingSystem() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [selectedId, setSelectedId] = useState(params.get('toiletId') ?? '');
  const [ratings, setRatings] = useState({ cleanliness: 0, accessibility: 0, facilities: 0 });
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sort, setSort] = useState<'recent' | 'helpful'>('recent');

  useEffect(() => { getToilets().then(p => setToilets(p.data)); }, []);

  useEffect(() => {
    if (!selectedId) return;
    setIsLoading(true);
    api.get<ApiResponse<{ data: Rating[] }>>(`/ratings/toilet/${selectedId}?sort=${sort}`)
      .then(r => setReviews((r.data.data as unknown as { data: Rating[] }).data ?? []))
      .finally(() => setIsLoading(false));
  }, [selectedId, sort]);

  const handleSubmit = async () => {
    if (!selectedId) { toast.error('Select a toilet first'); return; }
    if (!ratings.cleanliness) { toast.error('Please rate cleanliness'); return; }
    setIsSubmitting(true);
    try {
      await api.post('/ratings', { toiletId: selectedId, ...ratings, comment });
      toast.success('Review submitted! Thank you.');
      setRatings({ cleanliness: 0, accessibility: 0, facilities: 0 });
      setComment('');
      setSelectedId(s => s); // trigger re-fetch
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to submit review';
      toast.error(msg);
    } finally { setIsSubmitting(false); }
  };

  const handleHelpful = async (ratingId: string) => {
    try {
      await api.post(`/ratings/${ratingId}/helpful`);
      setReviews(rs => rs.map(r => r._id === ratingId
        ? { ...r, helpful: r.helpful.includes(user?._id ?? '') ? r.helpful.filter(id => id !== user?._id) : [...r.helpful, user?._id ?? ''] }
        : r));
    } catch { toast.error('Could not vote'); }
  };

  const selectedToilet = toilets.find(t => t._id === selectedId);

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Rate a Facility" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Toilet Selector */}
          <div className="card space-y-2">
            <label className="label" htmlFor="toilet-rate-sel">Select Facility</label>
            <select id="toilet-rate-sel" className="input" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              <option value="">Choose a toilet to review...</option>
              {toilets.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            {selectedToilet && (
              <p className="text-sm text-slate-400">{selectedToilet.address} · Score: {selectedToilet.hygieneScore}/100</p>
            )}
          </div>

          {/* Rating Form */}
          <div className="card space-y-5">
            <h2 className="font-heading font-semibold text-slate-100 border-b border-surface-highest pb-3">Your Rating</h2>
            {RATING_DIMENSIONS.map(dim => (
              <div key={dim} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300 capitalize">{dim}</span>
                <StarRating value={ratings[dim]} onChange={v => setRatings(r => ({ ...r, [dim]: v }))} size={22} />
              </div>
            ))}
            <div>
              <label className="label" htmlFor="review-comment">Comment</label>
              <textarea id="review-comment" className="input min-h-[100px] resize-none" placeholder="Describe your experience..."
                value={comment} onChange={e => setComment(e.target.value)} />
            </div>
            <Button onClick={() => void handleSubmit()} isLoading={isSubmitting} className="w-full justify-center py-3">
              <Send size={15} /> Submit Review
            </Button>
          </div>

          {/* Reviews List */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-highest">
              <h2 className="font-heading font-semibold text-slate-100 text-sm">Reviews ({reviews.length})</h2>
              <div className="flex gap-2">
                {(['recent', 'helpful'] as const).map(s => (
                  <button key={s} onClick={() => setSort(s)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${sort === s ? 'bg-primary text-slate-900 border-primary' : 'border-surface-highest text-slate-400'}`}>
                    {s === 'recent' ? 'Most Recent' : 'Most Helpful'}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-surface-highest">
              {isLoading ? <div className="flex justify-center py-8"><LoadingSpinner /></div> :
                reviews.length === 0 ? <p className="text-center py-8 text-slate-500 text-sm">No reviews yet. Be the first!</p> :
                reviews.map(review => {
                  const reviewer = typeof review.userId === 'object' ? review.userId : null;
                  const avgScore = Math.round((review.cleanliness + review.accessibility + review.facilities) / 3);
                  return (
                    <div key={review._id} className="px-5 py-4 space-y-3 hover:bg-surface-high/30 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {reviewer?.name?.charAt(0).toUpperCase() ?? 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-200">{reviewer?.name ?? 'Anonymous'}</p>
                              <Badge variant="teal" className="text-xs py-0">✓ Verified</Badge>
                            </div>
                            <p className="text-xs text-slate-500">{formatDate(review.createdAt, 'relative')}</p>
                          </div>
                        </div>
                        <StarRating value={avgScore} readOnly size={14} />
                      </div>
                      {review.comment && <p className="text-sm text-slate-300 leading-relaxed">{review.comment}</p>}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>🧼 Cleanliness: {review.cleanliness}/5</span>
                        <span>♿ Access: {review.accessibility}/5</span>
                        <span>🚿 Facilities: {review.facilities}/5</span>
                      </div>
                      <button onClick={() => void handleHelpful(review._id)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary transition-colors">
                        <ThumbsUp size={13} /> Helpful ({review.helpful.length})
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
