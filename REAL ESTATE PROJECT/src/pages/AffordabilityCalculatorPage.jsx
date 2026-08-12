import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { 
  Sparkles, Landmark, AlertTriangle, ShieldCheck, 
  HelpCircle, DollarSign, Calculator, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AffordabilityCalculatorPage() {
  const navigate = useNavigate();

  // Inputs
  const [monthlyIncome, setMonthlyIncome] = useState(80000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(25000);
  const [targetSavings, setTargetSavings] = useState(15000);
  const [selectedRent, setSelectedRent] = useState(22000);
  const [preferredLocation, setPreferredLocation] = useState("Hyderabad");

  // Calculations
  const calculations = useMemo(() => {
    // 30% rule for ideal rent
    const idealRent = Math.round(monthlyIncome * 0.3);
    
    // Max absolute limit (50% of income minus some buffer)
    const maxAffordableRent = Math.round(Math.max(0, (monthlyIncome - monthlyExpenses) * 0.8));
    const minAffordableRent = Math.round(monthlyIncome * 0.15);

    // Leftover calculations based on selectedRent
    const leftoverIncome = monthlyIncome - monthlyExpenses - targetSavings - selectedRent;

    // Risk scoring
    let riskLevel = "Low Risk";
    let riskColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    let riskDesc = "Your selected rent is well within safe thresholds. You have healthy breathing room for savings and unexpected emergencies.";

    const rentRatio = selectedRent / monthlyIncome;
    if (leftoverIncome < 0) {
      riskLevel = "Extreme Risk";
      riskColor = "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse";
      riskDesc = "CRITICAL: Your selected rent and expenses exceed your income. You will be actively draining your savings each month.";
    } else if (rentRatio > 0.45) {
      riskLevel = "High Risk";
      riskColor = "text-red-400 bg-red-500/10 border-red-500/20";
      riskDesc = "WARNING: Rent takes up more than 45% of your gross income. You will have minimal cushion if emergency expenses occur.";
    } else if (rentRatio > 0.3) {
      riskLevel = "Medium Risk";
      riskColor = "text-orange-400 bg-orange-500/10 border-orange-500/20";
      riskDesc = "MODERATE: Rent is between 30% and 45% of your income. It is manageable, but requires strict budgeting on discretionary expenses.";
    }

    // AI Financial advice phrases
    let financialAdvice = "Your financial layout is stable. Consider checking listings in Gachibowli or Ameerpet matching this price.";
    if (leftoverIncome < 0) {
      financialAdvice = "AI Advice: Reduce your target savings or look for shared flatting accommodations to stay in the green.";
    } else if (selectedRent > idealRent) {
      financialAdvice = `AI Advice: Your rent is ₹${(selectedRent - idealRent).toLocaleString()} above the standard 30% rule. Trim dining out or lifestyle bills by 10% to support this choice.`;
    } else {
      financialAdvice = `AI Advice: Excellent! You are spending less than 30% of your income on rent. You can safely allocate the surplus ₹${leftoverIncome.toLocaleString()} to investments or travel.`;
    }

    return {
      idealRent,
      minAffordableRent,
      maxAffordableRent,
      leftoverIncome,
      riskLevel,
      riskColor,
      riskDesc,
      financialAdvice
    };
  }, [monthlyIncome, monthlyExpenses, targetSavings, selectedRent]);

  // Chart Data mapping
  const chartData = useMemo(() => {
    const leftover = Math.max(0, calculations.leftoverIncome);
    return [
      { name: 'Selected Rent', value: selectedRent, color: '#d4af37' },
      { name: 'Monthly Expenses', value: monthlyExpenses, color: '#aa841e' },
      { name: 'Target Savings', value: targetSavings, color: '#f3e5ab' },
      { name: 'Surplus Cash', value: leftover, color: '#854d0e' },
    ];
  }, [selectedRent, monthlyExpenses, targetSavings, calculations.leftoverIncome]);

  const COLORS = ['#d4af37', '#aa841e', '#f3e5ab', '#854d0e'];

  const handleNavigateToMatches = () => {
    navigate(`/search?q=2BHK rent under ${selectedRent} in ${preferredLocation}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#FFFDF7] pb-20 animate-fade-in text-[#2D2A26]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Page title */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-gold text-xs font-bold shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" />
            FINANCIAL INTELLIGENCE TOOL
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#2D2A26] leading-tight">
            AI Rental Affordability Calculator
          </h1>
          <p className="text-[#6F6A61] text-xs sm:text-sm font-semibold">
            Evaluate your rental budget, simulate monthly leftover surplus, and review tailored risk assessments.
          </p>
        </div>

        {/* Core Double panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start text-left">
          
          {/* Left panel: Input parameters */}
          <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 space-y-6 shadow-md">
            <h3 className="font-display font-bold text-[#2D2A26] text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-gold" />
              Monthly Budget Simulator
            </h3>

            {/* Income Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <label className="text-[#6F6A61] uppercase tracking-wider">Gross Monthly Income</label>
                <span className="text-[#2D2A26] text-sm">₹{monthlyIncome.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="20000" 
                max="300000" 
                step="5000"
                value={monthlyIncome} 
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setMonthlyIncome(val);
                  if (selectedRent > val * 0.5) setSelectedRent(Math.round(val * 0.3));
                }}
                className="w-full h-2 bg-[#F3EDE0] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
              />
            </div>

            {/* Expenses Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <label className="text-[#6F6A61] uppercase tracking-wider">Estimated Monthly Expenses (Excl. Rent)</label>
                <span className="text-[#2D2A26] text-sm">₹{monthlyExpenses.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="5000" 
                max="150000" 
                step="2000"
                value={monthlyExpenses} 
                onChange={(e) => setMonthlyExpenses(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-[#F3EDE0] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
              />
            </div>

            {/* Target Savings Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <label className="text-[#6F6A61] uppercase tracking-wider">Monthly Target Savings</label>
                <span className="text-[#2D2A26] text-sm">₹{targetSavings.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100000" 
                step="2000"
                value={targetSavings} 
                onChange={(e) => setTargetSavings(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-[#F3EDE0] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
              />
            </div>

            {/* Selected Rent Simulation */}
            <div className="space-y-2 pt-4 border-t border-[#E8E1D5]">
              <div className="flex justify-between items-center text-xs font-bold">
                <label className="text-gold font-bold uppercase tracking-wider">Simulated Rent Price</label>
                <span className="text-gold font-extrabold text-base">₹{selectedRent.toLocaleString()}/mo</span>
              </div>
              <input 
                type="range" 
                min="5000" 
                max="120000" 
                step="1000"
                value={selectedRent} 
                onChange={(e) => setSelectedRent(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-[#F3EDE0] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
              />
            </div>

            {/* Target Location */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6F6A61] uppercase tracking-wider block">Preferred Search Location</label>
              <select 
                value={preferredLocation} 
                onChange={(e) => setPreferredLocation(e.target.value)}
                className="w-full bg-white border border-[#E8E1D5] rounded-xl text-xs font-bold text-[#2D2A26] py-3 px-4 focus:outline-none focus:border-[#d4af37]"
              >
                <option value="Hyderabad">Hyderabad</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Pune">Pune</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>

          </div>

          {/* Right panel: Live AI Metrics & Recommendations */}
          <div className="space-y-6">
            
            {/* Risk Indicator Card */}
            <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row gap-4 items-start shadow-lg transition-all duration-300 ${calculations.riskColor}`}>
              <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1 text-left">
                <h4 className="font-display font-extrabold text-sm sm:text-base">Risk Level: {calculations.riskLevel}</h4>
                <p className="text-xs font-semibold leading-relaxed opacity-90">{calculations.riskDesc}</p>
              </div>
            </div>

            {/* Math Ranges breakdown */}
            <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 space-y-4 shadow-md text-xs font-semibold text-[#6F6A61]">
              <div className="flex justify-between items-center py-1">
                <span>Recommended Ideal Rent (30% Rule)</span>
                <span className="text-[#2D2A26] font-bold">₹{calculations.idealRent.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-[#E8E1D5]">
                <span>Affordable Budget Range (Based on parameters)</span>
                <span className="text-[#2D2A26] font-bold">₹{calculations.minAffordableRent.toLocaleString()} - ₹{calculations.maxAffordableRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-[#E8E1D5]">
                <span>Simulated Surplus (Leftover cash)</span>
                <span className={`font-bold ${calculations.leftoverIncome >= 0 ? 'text-gold' : 'text-red-400'}`}>
                  ₹{calculations.leftoverIncome.toLocaleString()}/mo
                </span>
              </div>
            </div>

            {/* Custom AI advice */}
            <div className="bg-gold/10 border border-gold/20 text-gold p-6 rounded-3xl shadow-lg text-left flex gap-3 items-start">
              <Sparkles className="h-5 w-5 text-gold shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <h5 className="font-display font-bold text-xs">AI Smart Advice</h5>
                <p className="text-xs font-semibold leading-relaxed text-[#b8962e]">{calculations.financialAdvice}</p>
              </div>
            </div>

            {/* Allocation pie chart */}
            <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 shadow-md">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 text-left">Simulated Income Allocation</h4>
              
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: 'rgba(212,175,55,0.2)', borderRadius: '12px', color: '#2D2A26' }} formatter={(value) => `₹${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Labels legend */}
                <div className="space-y-1 text-left pl-4 w-44 shrink-0">
                  {chartData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Search button */}
            {calculations.leftoverIncome >= 0 && (
              <button
                onClick={handleNavigateToMatches}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold to-luxury-gold-dark text-[#0a0e1a] font-black text-sm tracking-wider uppercase transition shadow-md flex items-center justify-center gap-1.5 hover:opacity-95"
              >
                Find Homes under ₹{selectedRent.toLocaleString()}/mo in {preferredLocation}
                <ArrowRight className="h-4.5 w-4.5 text-[#0a0e1a]" />
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
