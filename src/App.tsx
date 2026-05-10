import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Linkedin, 
  Twitter, 
  Instagram, 
  Facebook, 
  Copy, 
  Check, 
  Sparkles, 
  Type, 
  Hash, 
  Smile,
  Send,
  RefreshCcw,
  AlertCircle,
  Menu,
  X as CloseIcon,
  Music,
  Pin,
  MessageSquare,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { arrangePost, generateEngagementComments, generateImagePrompt, SocialPlatform, ContentTone } from './services/geminiService';

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [comments, setComments] = useState('');
  const [imagePrompt, setImagePrompt] = useState<{ prompt: string; visualDescription: string; style: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [platform, setPlatform] = useState<SocialPlatform>('linkedin');
  const [tone, setTone] = useState<ContentTone>('professional');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [useEmojis, setUseEmojis] = useState(true);
  const [boostEngagement, setBoostEngagement] = useState(false);
  const [generateImage, setGenerateImage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [commentsCopied, setCommentsCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);

  const handleArrange = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setLoadingComments(boostEngagement);
    setLoadingImage(generateImage);
    setError(null);
    setComments('');
    setImagePrompt(null);
    try {
      const result = await arrangePost(input, {
        platform,
        tone,
        includeHashtags,
        useEmojis
      });
      setOutput(result);

      const tasks = [];
      if (boostEngagement) {
        tasks.push(generateEngagementComments(result, platform).then(comms => {
          setComments(comms);
          setLoadingComments(false);
        }));
      }

      if (generateImage) {
        tasks.push(generateImagePrompt(result).then(promptData => {
          setImagePrompt(promptData);
          setLoadingImage(false);
        }));
      }

      await Promise.all(tasks);

      // Auto-scroll on mobile
      if (window.innerWidth < 768) {
        outputRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoadingComments(false);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCommentsToClipboard = () => {
    navigator.clipboard.writeText(comments);
    setCommentsCopied(true);
    setTimeout(() => setCommentsCopied(false), 2000);
  };

  const copyPromptToClipboard = () => {
    if (imagePrompt) {
      navigator.clipboard.writeText(imagePrompt.prompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    }
  };

  const platforms: { id: SocialPlatform; icon: any; label: string }[] = [
    { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
    { id: 'twitter', icon: Twitter, label: 'X (Twitter)' },
    { id: 'instagram', icon: Instagram, label: 'Instagram' },
    { id: 'facebook', icon: Facebook, label: 'Facebook' },
    { id: 'tiktok', icon: Music, label: 'TikTok' },
    { id: 'pinterest', icon: Pin, label: 'Pinterest' },
    { id: 'reddit', icon: MessageSquare, label: 'Reddit' },
    { id: 'substack', icon: BookOpen, label: 'Substack' },
  ];

  const tones: { id: ContentTone; label: string }[] = [
    { id: 'professional', label: 'Professional' },
    { id: 'engaging', label: 'Engaging' },
    { id: 'minimalist', label: 'Minimalist' },
    { id: 'bold', label: 'Bold' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans selection:bg-[#E2E8F0]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-[#F1F1F1] z-50 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">SocialFlow</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <span className="text-xs font-medium uppercase tracking-widest text-[#888]">Post Arranger v1.0</span>
          <div className="h-4 w-px bg-[#F1F1F1]" />
          <button className="text-sm font-medium hover:text-[#555] transition-colors">Documentation</button>
        </div>

        <button 
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-12 min-h-[calc(100vh-6rem)]">
        
        {/* Left Side: Input & Settings */}
        <section className="flex flex-col gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-light tracking-tight text-[#1A1A1A]">
              Optimize your <span className="font-medium">story.</span>
            </h1>
            <p className="text-[#666] text-sm max-w-md leading-relaxed">
              Paste your raw thoughts below. We'll handle the hooks, formatting, and platform-specific nuances.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#999] px-1">Raw Content</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your link, long text, or raw notes here..."
                className="w-full h-48 bg-white border border-[#E9E9E9] rounded-2xl p-6 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5 focus:border-[#D1D1D1] transition-all placeholder:text-[#BBB]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#999] px-1">Platform</label>
                <div className="relative">
                  <select 
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
                    className="w-full h-11 bg-white border border-[#E9E9E9] rounded-xl px-4 pr-10 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5"
                  >
                    {platforms.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {(() => {
                      const PlatformIcon = platforms.find(p => p.id === platform)?.icon || Linkedin;
                      return <PlatformIcon className="w-4 h-4 text-[#888]" />;
                    })()}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#999] px-1">Tone</label>
                <div className="relative">
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value as ContentTone)}
                    className="w-full h-11 bg-white border border-[#E9E9E9] rounded-xl px-4 pr-10 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5"
                  >
                    {tones.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Type className="w-4 h-4 text-[#888]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-[#F9F9F9] rounded-xl p-4">
              <button 
                onClick={() => setIncludeHashtags(!includeHashtags)}
                className={cn(
                  "flex items-center gap-2 text-xs font-semibold transition-colors",
                  includeHashtags ? "text-[#1A1A1A]" : "text-[#AAA]"
                )}
              >
                <Hash className={cn("w-4 h-4", includeHashtags ? "text-[#1A1A1A]" : "text-[#CCC]")} />
                Hashtags
              </button>
              <div className="w-px h-4 bg-[#E9E9E9]" />
              <button 
                onClick={() => setUseEmojis(!useEmojis)}
                className={cn(
                  "flex items-center gap-2 text-xs font-semibold transition-colors",
                  useEmojis ? "text-[#1A1A1A]" : "text-[#AAA]"
                )}
              >
                <Smile className={cn("w-4 h-4", useEmojis ? "text-[#1A1A1A]" : "text-[#CCC]")} />
                Emojis
              </button>
              <div className="w-px h-4 bg-[#E9E9E9]" />
              <button 
                onClick={() => setBoostEngagement(!boostEngagement)}
                className={cn(
                  "flex items-center gap-2 text-xs font-semibold transition-colors",
                  boostEngagement ? "text-[#1A1A1A]" : "text-[#AAA]"
                )}
              >
                <MessageSquare className={cn("w-4 h-4", boostEngagement ? "text-[#1A1A1A]" : "text-[#CCC]")} />
                Boost
              </button>
              <div className="w-px h-4 bg-[#E9E9E9]" />
              <button 
                onClick={() => setGenerateImage(!generateImage)}
                className={cn(
                  "flex items-center gap-2 text-xs font-semibold transition-colors",
                  generateImage ? "text-[#1A1A1A]" : "text-[#AAA]"
                )}
              >
                <ImageIcon className={cn("w-4 h-4", generateImage ? "text-[#1A1A1A]" : "text-[#CCC]")} />
                Visuals
              </button>
              <div className="w-px h-4 bg-[#E9E9E9] ml-auto" />
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#10B981] uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                SEO Ready
              </div>
            </div>

            <button
              onClick={handleArrange}
              disabled={loading || !input.trim()}
              className="w-full h-14 bg-[#1A1A1A] text-white rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-[#333] transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-black/5"
            >
              {loading ? (
                <RefreshCcw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Arrange Post</span>
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Side: Output Preview */}
        <section ref={outputRef} className="relative">
          <AnimatePresence mode="wait">
            {!output && !loading ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full min-h-[400px] border-2 border-dashed border-[#F1F1F1] rounded-3xl flex flex-col items-center justify-center text-center p-12"
              >
                <div className="w-16 h-16 bg-[#F9F9F9] rounded-full flex items-center justify-center mb-6">
                  {platform === 'linkedin' && <Linkedin className="w-8 h-8 text-[#CCC]" />}
                  {platform === 'twitter' && <Twitter className="w-8 h-8 text-[#CCC]" />}
                  {platform === 'instagram' && <Instagram className="w-8 h-8 text-[#CCC]" />}
                  {platform === 'facebook' && <Facebook className="w-8 h-8 text-[#CCC]" />}
                  {platform === 'tiktok' && <Music className="w-8 h-8 text-[#CCC]" />}
                  {platform === 'pinterest' && <Pin className="w-8 h-8 text-[#CCC]" />}
                  {platform === 'reddit' && <MessageSquare className="w-8 h-8 text-[#CCC]" />}
                  {platform === 'substack' && <BookOpen className="w-8 h-8 text-[#CCC]" />}
                </div>
                <h3 className="font-semibold text-[#1A1A1A] mb-2">Ready to optimize</h3>
                <p className="text-sm text-[#888] max-w-[240px]">
                  Your preview will appear here once you click "Arrange Post".
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="output"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col"
              >
                <div className="bg-white border border-[#E9E9E9] rounded-3xl shadow-sm overflow-hidden flex flex-col h-full ring-1 ring-black/[0.02]">
                  {/* Preview Header */}
                  <div className="px-8 py-6 border-b border-[#F1F1F1] flex items-center justify-between bg-[#FCFCFC]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-[#EEE] flex items-center justify-center bg-white">
                        {platform === 'linkedin' && <Linkedin className="w-5 h-5 text-[#0A66C2]" />}
                        {platform === 'twitter' && <span className="font-bold text-lg">𝕏</span>}
                        {platform === 'instagram' && <Instagram className="w-5 h-5 text-[#E4405F]" />}
                        {platform === 'facebook' && <Facebook className="w-5 h-5 text-[#1877F2]" />}
                        {platform === 'tiktok' && <Music className="w-5 h-5 text-[#000000]" />}
                        {platform === 'pinterest' && <Pin className="w-5 h-5 text-[#E60023]" />}
                        {platform === 'reddit' && <MessageSquare className="w-5 h-5 text-[#FF4500]" />}
                        {platform === 'substack' && <BookOpen className="w-5 h-5 text-[#FF6719]" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-[#999] leading-none mb-1">Preview</div>
                        <div className="text-sm font-semibold capitalize text-[#1A1A1A]">{platform}</div>
                      </div>
                    </div>

                    <button 
                      onClick={copyToClipboard}
                      className={cn(
                        "h-10 px-4 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all",
                        copied ? "bg-[#10B981] text-white" : "bg-[#F3F4F6] text-[#1A1A1A] hover:bg-[#E5E7EB]"
                      )}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>

                  {/* Output Text */}
                  <div className="flex-1 p-8 overflow-y-auto bg-white">
                    {loading ? (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-[#F5F5F5] rounded w-3/4" />
                        <div className="h-4 bg-[#F5F5F5] rounded w-full" />
                        <div className="h-4 bg-[#F5F5F5] rounded w-5/6" />
                        <div className="h-32 bg-[#F5F5F5] rounded w-full" />
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:text-[#333] whitespace-pre-wrap font-sans text-[15px]">
                        <ReactMarkdown>{output}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Footer Stats */}
                  <div className="px-8 py-4 bg-[#F9F9F9] border-t border-[#F1F1F1] flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-[#AAA]">
                    <div className="flex gap-6">
                      <span>{output.length} characters</span>
                      <span>{output.split(/\s+/).length} words</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                       <span>Generated by Gemini</span>
                    </div>
                  </div>
                </div>

                {/* Engagement Comments Section */}
                {(boostEngagement || comments) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-white border border-[#E9E9E9] rounded-3xl overflow-hidden shadow-sm ring-1 ring-black/[0.02]"
                  >
                    <div className="px-8 py-4 border-b border-[#F1F1F1] flex items-center justify-between bg-[#FCFCFC]">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#1A1A1A]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">First 5 Comments</span>
                      </div>
                      {comments && (
                        <button 
                          onClick={copyCommentsToClipboard}
                          className={cn(
                            "h-8 px-3 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all",
                            commentsCopied ? "bg-[#10B981] text-white" : "bg-[#F3F4F6] text-[#1A1A1A] hover:bg-[#E5E7EB]"
                          )}
                        >
                          {commentsCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {commentsCopied ? "Copied" : "Copy All"}
                        </button>
                      )}
                    </div>
                    <div className="p-8">
                      {loadingComments ? (
                        <div className="space-y-4 animate-pulse">
                          <div className="h-3 bg-[#F5F5F5] rounded w-1/2" />
                          <div className="h-3 bg-[#F5F5F5] rounded w-2/3" />
                          <div className="h-3 bg-[#F5F5F5] rounded w-full" />
                        </div>
                      ) : (
                        <div className="prose prose-sm max-w-none prose-p:text-[#666] prose-li:text-[#666]">
                          <ReactMarkdown>{comments}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Visual Strategy Section */}
                {(generateImage || imagePrompt) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-white border border-[#E9E9E9] rounded-3xl overflow-hidden shadow-sm ring-1 ring-black/[0.02]"
                  >
                    <div className="px-8 py-4 border-b border-[#F1F1F1] flex items-center justify-between bg-[#FCFCFC]">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#1A1A1A]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">Visual Strategy</span>
                      </div>
                      {imagePrompt && (
                        <button 
                          onClick={copyPromptToClipboard}
                          className={cn(
                            "h-8 px-3 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all",
                            promptCopied ? "bg-[#10B981] text-white" : "bg-[#F3F4F6] text-[#1A1A1A] hover:bg-[#E5E7EB]"
                          )}
                        >
                          {promptCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {promptCopied ? "Copied Prompt" : "Copy AI Prompt"}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 h-full">
                      <div className="md:col-span-2 relative aspect-video md:aspect-square bg-[#F9F9F9] border-r border-[#F1F1F1] overflow-hidden group">
                        {loadingImage ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <RefreshCcw className="w-6 h-6 text-[#DDD] animate-spin" />
                          </div>
                        ) : imagePrompt ? (
                          <>
                            <img 
                              src={`https://picsum.photos/seed/${encodeURIComponent(imagePrompt.visualDescription)}/800/800`}
                              alt={imagePrompt.visualDescription}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                               <p className="text-[10px] font-medium text-white/90 leading-tight">Concept: {imagePrompt.visualDescription}</p>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#CCC] p-8 text-center">
                             <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                             <p className="text-[10px] font-bold uppercase tracking-widest">Image Placeholder</p>
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-3 p-8 flex flex-col justify-center">
                         <div className="text-[10px] font-bold text-[#AAA] uppercase tracking-[0.2em] mb-4">AI Asset Generation Prompt</div>
                         {loadingImage ? (
                           <div className="space-y-2">
                             <div className="h-3 bg-[#F5F5F5] rounded w-full animate-pulse" />
                             <div className="h-3 bg-[#F5F5F5] rounded w-5/6 animate-pulse" />
                             <div className="h-3 bg-[#F5F5F5] rounded w-4/6 animate-pulse" />
                           </div>
                         ) : imagePrompt ? (
                           <p className="text-[13px] text-[#555] italic leading-relaxed font-mono">
                             "{imagePrompt.prompt}"
                           </p>
                         ) : (
                           <p className="text-[13px] text-[#BBB] italic">Prompts will be generated based on your post context.</p>
                         )}
                         <div className="mt-6 flex gap-3">
                            <span className="px-2 py-1 bg-[#F5F5F5] text-[9px] font-bold text-[#888] rounded-md uppercase tracking-wider">Style: {imagePrompt?.style || 'Pending'}</span>
                            <span className="px-2 py-1 bg-[#F5F5F5] text-[9px] font-bold text-[#888] rounded-md uppercase tracking-wider">Ratio: 1:1</span>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="absolute -bottom-16 left-0 right-0 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-shake">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </section>
      </main>

      {/* Footer Design Accents */}
      <footer className="mt-auto px-6 sm:px-12 py-12 border-t border-[#F1F1F1]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#F1F1F1] rounded flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-[#1A1A1A]" />
              </div>
              <span className="font-bold text-sm tracking-tight uppercase">SocialFlow</span>
            </div>
            <p className="text-[#AAA] text-[10px] uppercase tracking-[0.2em]">The art of digital optimization.</p>
          </div>
          
          <div className="flex gap-12">
            <div>
              <div className="text-[10px] font-bold text-[#AAA] uppercase tracking-[0.2em] mb-4">Core Tech</div>
              <div className="flex flex-col gap-2 text-sm font-medium text-[#666]">
                <span>Gemini 3 Flash</span>
                <span>Vite React</span>
                <span>Tailwind CSS</span>
              </div>
            </div>
            <div>
               <div className="text-[10px] font-bold text-[#AAA] uppercase tracking-[0.2em] mb-4">Project</div>
                <div className="flex flex-col gap-2 text-sm font-medium text-[#666]">
                  <span>Source Code</span>
                  <span>License</span>
                  <span>Contact</span>
                </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Action Indicators (Recipe 1 style) */}
      <div className="fixed bottom-8 left-8 hidden lg:block">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 group">
            <div className="w-1 h-1 bg-[#1A1A1A] group-hover:h-3 transition-all" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 group-hover:opacity-100 transition-opacity">Ready to sync</span>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="w-1 h-1 bg-[#1A1A1A] group-hover:h-3 transition-all" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 group-hover:opacity-100 transition-opacity">AI Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
