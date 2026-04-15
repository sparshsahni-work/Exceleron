import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  BarChart3,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Download,
  Share2,
  X,
  DollarSign,
  Users,
  Calendar,
  Award,
  CheckCircle,
  Info,
  Copy,
  Mail,
  Twitter,
  Ruler,
  Clock,
  Zap // NEW: Added Zap for Anomaly icon
} from 'lucide-react';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const ShareModal = ({ insight, onClose }) => {
  const shareText = `AI Insight: ${insight.title}\n\nDescription: ${insight.description}\n\nRecommendation: ${insight.recommendation}`;

  const handleCopyToClipboard = () => {
    // FIX: Using modern Clipboard API instead of obsolete execCommand
    navigator.clipboard.writeText(shareText).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy.');
    });
  };

  const handleShareByEmail = () => {
    const subject = encodeURIComponent(`Data Insight: ${insight.title}`);
    const body = encodeURIComponent(shareText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareToTwitter = () => {
    const text = encodeURIComponent(`Check out this data insight: "${insight.title}"\n\n${insight.description}`);
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Share Insight</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">Share "{insight.title}" via:</p>
          <button onClick={handleCopyToClipboard} className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
            <Copy className="w-5 h-5 text-blue-400" />
            <span>Copy to Clipboard</span>
          </button>
          <button onClick={handleShareByEmail} className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
            <Mail className="w-5 h-5 text-green-400" />
            <span>Share via Email</span>
          </button>
          <button onClick={handleShareToTwitter} className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
            <Twitter className="w-5 h-5 text-sky-400" />
            <span>Share on Twitter</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const InsightMetrics = ({ details }) => {
  const metrics = [
    { icon: BarChart3, label: details.metric, value: details.value, color: 'text-green-400' },
    { icon: Clock, label: "Period", value: details.period, color: 'text-yellow-400' },
    { icon: Ruler, label: "Comparison", value: details.comparison, color: 'text-blue-400' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
          <div className="flex items-center space-x-3 mb-2">
            <metric.icon className={`w-5 h-5 ${metric.color}`} />
            <h5 className="text-sm text-gray-300 font-medium">{metric.label}</h5>
          </div>
          <p className="text-xl font-bold text-white truncate" title={metric.value}>{metric.value}</p>
        </div>
      ))}
    </div>
  );
};


const AIInsights = ({ fileData, chartData, onInsightGenerated }) => {
  const [insights, setInsights] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleExportInsight = (insight) => {
    const doc = new jsPDF();
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(insight.title, 15, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Confidence: ${insight.confidence}%`, 15, 28);
    doc.text(`Impact: ${insight.impact.toUpperCase()}`, 55, 28);
    
    doc.setLineWidth(0.5);
    doc.line(15, 32, 195, 32);

    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Analysis:', 15, 40);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    const analysisLines = doc.splitTextToSize(insight.description, 180);
    doc.text(analysisLines, 15, 46);

    let currentY = 46 + (analysisLines.length * 6) + 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Strategic Recommendation:', 15, currentY);
    doc.setFont('helvetica', 'normal');
    const recommendationLines = doc.splitTextToSize(insight.recommendation, 180);
    doc.text(recommendationLines, 15, currentY + 6);
    
    currentY += 6 + (recommendationLines.length * 6) + 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Action Items:', 15, currentY);
    doc.setFont('helvetica', 'normal');
    insight.details.actionItems.forEach((item, index) => {
      doc.text(`• ${item}`, 20, currentY + 6 + (index * 6));
    });

    doc.save(`${insight.title.replace(/\s+/g, '-')}.pdf`);
  };

  const generateInsights = () => {
    if (!fileData || !fileData.datasets || !fileData.datasets[0]) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          generateDataSpecificInsights();
          return 100;
        }
        return prev + 8;
      });
    }, 150);
  };

  const generateDataSpecificInsights = () => {
    const data = fileData.datasets[0].data;
    const labels = fileData.labels;
    const metadata = fileData.metadata;
    
    if (!data || data.length < 3) return; // Need at least 3 data points for some stats

    let insights = [];
    let insightIdCounter = 1;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const total = data.reduce((a, b) => a + b, 0);
    const maxIndex = data.indexOf(max);
    
    // Original Insights (with unique IDs)
    const growth = data[0] !== 0 ? ((data[data.length - 1] - data[0]) / data[0]) * 100 : 0;
    const recentGrowth = data[data.length - 2] !== 0 ? ((data[data.length - 1] - data[data.length - 2]) / data[data.length - 2]) * 100 : 0;
    insights.push({ id: insightIdCounter++, type: growth > 0 ? 'growth' : 'decline', title: growth > 0 ? 'Positive Growth Trajectory' : 'Declining Performance', description: `${Math.abs(growth).toFixed(1)}% ${growth > 0 ? 'increase' : 'decrease'} from ${labels[0]} to ${labels[labels.length - 1]}.`, confidence: 95, impact: Math.abs(growth) > 20 ? 'high' : 'medium', icon: growth > 0 ? TrendingUp : TrendingDown, color: growth > 0 ? 'text-green-500' : 'text-red-500', bgColor: growth > 0 ? 'bg-green-500/10' : 'bg-red-500/10', borderColor: growth > 0 ? 'border-green-500/20' : 'border-red-500/20', recommendation: growth > 0 ? `Capitalize on this momentum.` : `Investigate the root causes for this decline.`, details: { metric: 'Overall Growth', value: `${growth.toFixed(1)}%`, period: `${labels[0]} to ${labels[labels.length - 1]}`, comparison: `Recent: ${recentGrowth.toFixed(1)}%` , actionItems: growth > 0 ? ['Scale initiatives', 'Monitor sustainability', 'Identify drivers'] : ['Root cause analysis', 'Intervention', 'Recovery planning'] }});
    const peakPerformance = avg !== 0 ? ((max - avg) / avg) * 100 : 0;
    insights.push({ id: insightIdCounter++, type: 'peak', title: 'Peak Performance Identified', description: `Highest performance of ${max.toLocaleString()} at ${labels[maxIndex]}, which is ${peakPerformance.toFixed(1)}% above average.`, confidence: 100, impact: peakPerformance > 50 ? 'high' : 'medium', icon: Award, color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', recommendation: `Analyze success factors from ${labels[maxIndex]} and replicate these strategies where applicable.`, details: { metric: 'Peak Value', value: max.toLocaleString(), period: labels[maxIndex], comparison: `${peakPerformance.toFixed(1)}% above avg`, actionItems: ['Document success factors', 'Replicate strategies', 'Set new benchmarks'] }});
    
    // NEW INSIGHT: Anomaly/Outlier Detection
    const variance = data.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    const outliers = data.map((val, i) => ({ val, i })).filter(item => Math.abs(item.val - avg) > 2 * stdDev);
    if (outliers.length > 0) {
        outliers.forEach(outlier => {
            const isHigh = outlier.val > avg;
            insights.push({
                id: insightIdCounter++, type: 'anomaly', title: `Anomaly Detected: ${isHigh ? 'Unusual High' : 'Unusual Low'}`,
                description: `The value for '${labels[outlier.i]}' (${outlier.val.toLocaleString()}) is a significant outlier, differing from the average by more than two standard deviations.`,
                confidence: 98, impact: 'high', icon: Zap, color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20',
                recommendation: `Investigate this anomaly. It could represent a data error, a one-time event, or a significant opportunity/threat.`,
                details: { metric: 'Outlier Value', value: outlier.val.toLocaleString(), period: labels[outlier.i], comparison: `${((outlier.val - avg) / avg * 100).toFixed(1)}% from avg`, actionItems: ['Verify data entry', 'Analyze event causes', 'Assess impact'] }
            });
        });
    }

    // NEW INSIGHT: Consecutive Trend Analysis
    let consecutiveIncrease = 0;
    let consecutiveDecrease = 0;
    for (let i = 1; i < data.length; i++) {
        if (data[i] > data[i-1]) {
            consecutiveIncrease++;
            consecutiveDecrease = 0;
        } else if (data[i] < data[i-1]) {
            consecutiveDecrease++;
            consecutiveIncrease = 0;
        }
        if (consecutiveIncrease >= 3) {
            insights.push({ id: insightIdCounter++, type: 'trend', title: `Sustained Growth Streak`, description: `Identified a strong upward trend for ${consecutiveIncrease} consecutive periods ending at ${labels[i]}.`, confidence: 85, impact: 'medium', icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20', recommendation: 'This indicates strong positive momentum. Identify the drivers and continue to support this trend.', details: { metric: 'Consecutive Growth', value: `${consecutiveIncrease} periods`, period: `${labels[i-consecutiveIncrease+1]} to ${labels[i]}`, comparison: 'Consistent Increase', actionItems: ['Identify growth drivers', 'Allocate more resources', 'Forecast future growth'] } });
            consecutiveIncrease = 0; // Reset after logging
        }
        if (consecutiveDecrease >= 3) {
            insights.push({ id: insightIdCounter++, type: 'trend', title: `Sustained Decline Streak`, description: `Identified a consistent decline for ${consecutiveDecrease} consecutive periods ending at ${labels[i]}.`, confidence: 85, impact: 'high', icon: TrendingDown, color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', recommendation: 'This requires immediate attention. A multi-period decline suggests a systemic issue that needs to be addressed.', details: { metric: 'Consecutive Decline', value: `${consecutiveDecrease} periods`, period: `${labels[i-consecutiveDecrease+1]} to ${labels[i]}`, comparison: 'Consistent Decrease', actionItems: ['Urgent investigation', 'Implement corrective action', 'Monitor closely'] } });
            consecutiveDecrease = 0; // Reset after logging
        }
    }

    // NEW INSIGHT: Pareto Principle (80/20 Rule)
    const sortedData = [...data].map((val, i) => ({ val, lbl: labels[i] })).sort((a, b) => b.val - a.val);
    let cumulativeValue = 0;
    let itemsCount = 0;
    for (const item of sortedData) {
        cumulativeValue += item.val;
        itemsCount++;
        if (cumulativeValue >= total * 0.8) {
            const percentageOfItems = (itemsCount / data.length) * 100;
            if (percentageOfItems <= 30) { // Check if a small percentage of items (e.g., <=30%) contributes to 80% of the value
                insights.push({
                    id: insightIdCounter++, type: 'pareto', title: 'Pareto Principle Observed (80/20 Rule)',
                    description: `The top ${itemsCount} items (${percentageOfItems.toFixed(0)}% of the total) account for approximately 80% of the total value.`,
                    confidence: 90, impact: 'high', icon: Target, color: 'text-purple-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20',
                    recommendation: `Focus resources on these high-impact items. Optimizing them will yield the greatest return on effort.`,
                    details: { metric: 'Top Contributors', value: `${itemsCount} of ${data.length}`, period: 'Full dataset', comparison: `~80% of total value`, actionItems: ['Prioritize key items', 'Optimize performance', 'Marketing focus'] }
                });
            }
            break;
        }
    }
    
    setInsights(insights);
    if (onInsightGenerated) {
      onInsightGenerated();
    }
  };

  useEffect(() => {
    if (fileData) {
      generateInsights();
    }
  }, [fileData, chartData]);
  
  // ... (rest of the component remains the same)
  // ...

  const getImpactBadge = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  if (!fileData) {
    return (
      <motion.div className="flex flex-col items-center justify-center h-96 text-gray-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Brain className="w-16 h-16 mb-4" />
        <p className="text-xl mb-2">AI Insights Ready</p>
        <p className="text-sm text-center max-w-md">Upload Excel data and generate charts to receive intelligent, data-driven insights.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center space-x-2"><Brain className="w-8 h-8 text-blue-500" /><span>AI Insights</span></h2>
          <p className="text-gray-400">Advanced analytics and intelligent recommendations for your data</p>
        </div>
        <motion.button onClick={generateInsights} disabled={isAnalyzing} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}</span>
        </motion.button>
      </div>

      {isAnalyzing && (
        <motion.div className="bg-gray-800 p-6 rounded-lg border border-blue-500/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <motion.div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" initial={{ width: 0 }} animate={{ width: `${analysisProgress}%` }} transition={{ duration: 0.3 }}/>
          </div>
          <p className="text-sm text-gray-400 text-center">AI is analyzing your data...</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <motion.div key={insight.id} className={`bg-gray-800 p-6 rounded-lg border ${insight.borderColor} cursor-pointer hover:bg-gray-750 group`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} onClick={() => setSelectedInsight(insight)}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${insight.bgColor}`}><insight.icon className={`w-6 h-6 ${insight.color}`} /></div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getImpactBadge(insight.impact)}`}>{insight.impact.toUpperCase()}</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{insight.title}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">{insight.description}</p>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white ml-auto" />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedInsight && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div className="bg-gray-800 p-6 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${selectedInsight.bgColor}`}>
                    <selectedInsight.icon className={`w-6 h-6 ${selectedInsight.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedInsight.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getImpactBadge(selectedInsight.impact)}`}>
                        {selectedInsight.impact.toUpperCase()} IMPACT
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedInsight(null)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-6">
                <div>
                    <h4 className="font-medium mb-2 text-sm text-gray-400">Confidence Score</h4>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <motion.div 
                            className="bg-green-500 h-2.5 rounded-full" 
                            style={{ width: `${selectedInsight.confidence}%` }}
                            initial={{width: 0}}
                            animate={{width: `${selectedInsight.confidence}%`}}
                            transition={{duration: 0.8, ease: "easeOut"}}
                        />
                    </div>
                    <p className="text-right text-sm font-bold mt-1">{selectedInsight.confidence}%</p>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2"><Info className="w-4 h-4 text-blue-500" /><span>Detailed Analysis</span></h4>
                  <p className="text-gray-300 bg-gray-900/50 p-4 rounded-lg">{selectedInsight.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2"><BarChart3 className="w-4 h-4 text-green-500" /><span>Key Metrics</span></h4>
                  <InsightMetrics details={selectedInsight.details} />
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2"><Lightbulb className="w-4 h-4 text-yellow-500" /><span>Strategic Recommendation</span></h4>
                  <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg"><p className="text-blue-300">{selectedInsight.recommendation}</p></div>
                </div>
                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-green-500" /><span>Action Items</span></h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {selectedInsight.details.actionItems.map((item, index) => (
                      <div key={index} className="bg-gray-700 p-3 rounded-lg flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                  <button onClick={() => handleExportInsight(selectedInsight)} className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
                    <Download className="w-4 h-4" /><span>Export Insight</span>
                  </button>
                  <button onClick={() => setShowShareModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                    <Share2 className="w-4 h-4" /><span>Share Analysis</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShareModal && selectedInsight && (
          <ShareModal 
            insight={selectedInsight} 
            onClose={() => setShowShareModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIInsights;