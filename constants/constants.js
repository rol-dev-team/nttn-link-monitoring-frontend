export const COLUMN_MAPPING = Object.freeze({
    ua: "Ua (V)",
    ub: "Ub (V)",
    uc: "Uc (V)",
    ia: "Ia (A)",
    ib: "Ib (A)",
    ic: "Ic (A)",
    uab: "Uab (V)",
    ubc: "Ubc (V)",
    uca: "Uca (V)",
    pa: "Pa (kW)",
    pb: "Pb (kW)",
    pc: "Pc (kW)",
    pfa: "PFa",
    pfb: "PFb",
    pfc: "PFc",
    zglys: "PF",
    f: "F (Hz)",
    u: "U (V)",
    i: "I (A)",
    zyggl: "P (kW)",
    zygsz: "Imp. kWh",
  });


  export const threePhaseColumnMapping = [
    'ua', 'ub', 'uc', 'ia', 'ib', 'ic', 'uab', 'ubc', 'uca',
    'pa', 'pb', 'pc', 'pfa', 'pfb', 'pfc', 'zglys', 'f'
];
  export const singlePhaseColumnMapping = [
    'u', 'i', 'zyggl', 'zglys', 'f'
];