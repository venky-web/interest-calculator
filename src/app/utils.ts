export interface IInterestParams {
  principal: number;
  rate: number; // percentage per annum
  startDate?: Date;
  endDate?: Date;
  interestType: 'simple' | 'compound';
  compoundFrequency?: 'yearly' | 'half-yearly' | 'quarterly' | 'monthly';
  years?: number;
  months?: number;
  days?: number;
}

export interface IInterestResult {
  duration: {
    years: number;
    months: number;
    days: number;
    totalDays: number;
    totalMonths: number;
    totalYears: number;
    totalStr?: string;
  };
  interestBreakdown: {
    interestPerDay: number;
    interestPerMonth: number;
    interestTotal: number;
  };
  totalAmount: number;
}

export function calculateInterestWithDates(params: IInterestParams): IInterestResult {
  const { principal, rate, interestType, compoundFrequency } = params;
  const startDate = new Date(params.startDate);
  const endDate = new Date(params.endDate);
  const msInDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / msInDay);

  const years = endDate.getFullYear() - startDate.getFullYear();
  const months = endDate.getMonth() - startDate.getMonth();
  const days = endDate.getDate() - startDate.getDate();

  const totalMonths = Math.floor(totalDays / 30.44); // average month duration
  const totalYears = totalDays / 365;

  let interestTotal = 0;

  if (interestType === 'simple') {
    interestTotal = (principal * rate * totalYears) / 100;
  } else {
    // compound interest with specified frequency
    let n = 1;
    switch (compoundFrequency) {
      case 'half-yearly': n = 2; break;
      case 'quarterly': n = 4; break;
      case 'monthly': n = 12; break;
      default: n = 1;
    }
    const compoundRate = rate / 100;
    const totalAmount = principal * Math.pow((1 + compoundRate / n), n * totalYears);
    interestTotal = totalAmount - principal;
  }

  const interestPerDay = totalDays > 0 ? interestTotal / totalDays : interestTotal;
  const interestPerMonth = totalMonths > 0 ? interestTotal / totalMonths : interestTotal;

  return {
    duration: {
      years: Math.floor(totalYears),
      months: months >= 0 ? months : (12 + months),
      days: days >= 0 ? days : (30 + days),
      totalDays,
      totalMonths,
      totalYears: parseFloat(totalYears.toFixed(2)),
      totalStr: `${Math.floor(totalYears)} Years, ${months >= 0 ? months : (12 + months)} Months, ${days >= 0 ? days : (30 + days)} Days`
    },
    interestBreakdown: {
      interestPerDay: parseFloat(interestPerDay.toFixed(2)),
      interestPerMonth: parseFloat(interestPerMonth.toFixed(2)),
      interestTotal: parseFloat(interestTotal.toFixed(2)),
    },
    totalAmount: parseFloat((principal + interestTotal).toFixed(2))
  };
}


export function calculateInterestWithDuration(params: IInterestParams): IInterestResult {
  const { principal, rate, years, months, days, interestType, compoundFrequency } = params;

  const totalDays = Math.floor( (years * 365) + (months * 30.44) + params.days);

  const totalMonths = Math.floor(totalDays / 30.44); // average month duration
  const totalYears = totalDays / 365;

  let interestTotal = 0;

  if (interestType === 'simple') {
    interestTotal = (principal * rate * totalYears) / 100;
  } else {
    // compound interest with specified frequency
    let n = 1;
    switch (compoundFrequency) {
      case 'half-yearly': n = 2; break;
      case 'quarterly': n = 4; break;
      case 'monthly': n = 12; break;
      default: n = 1;
    }
    const compoundRate = rate / 100;
    const totalAmount = principal * Math.pow((1 + compoundRate / n), n * totalYears);
    interestTotal = totalAmount - principal;
  }

  const interestPerDay = interestTotal / totalDays;
  const interestPerMonth = interestTotal / totalMonths;

  return {
    duration: {
      years: Math.floor(totalYears),
      months: months >= 0 ? months : (12 + months),
      days: days >= 0 ? days : (30 + days),
      totalDays,
      totalMonths,
      totalYears: parseFloat(totalYears.toFixed(2)),
      totalStr: `${years} Years, ${months} Months, ${days} Days`
    },
    interestBreakdown: {
      interestPerDay: parseFloat(interestPerDay.toFixed(2)),
      interestPerMonth: parseFloat(interestPerMonth.toFixed(2)),
      interestTotal: parseFloat(interestTotal.toFixed(2)),
    },
    totalAmount: parseFloat((principal + interestTotal).toFixed(2))
  };
}