(() => {
  const $ = (id) => document.getElementById(id);
  const fmtUSD = (n) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const fmtUSDc = (n) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  const fmtPct = (n) => `${n.toFixed(2)}%`;

  // ---------- Calc helpers ----------

  // Standard amortization formula. P&I monthly payment.
  function principalAndInterest(loanAmount, annualRatePct, termYears) {
    if (loanAmount <= 0) return 0;
    const r = annualRatePct / 100 / 12;
    const n = termYears * 12;
    if (r === 0) return loanAmount / n;
    return (loanAmount * r) / (1 - Math.pow(1 + r, -n));
  }

  function computeScenario({ price, dpPct, rate, term, taxRate, insRate, pmiRate }) {
    const downPayment = price * (dpPct / 100);
    const loan = price - downPayment;
    const pi = principalAndInterest(loan, rate, term);
    const taxMonthly = (price * (taxRate / 100)) / 12;
    const insMonthly = (price * (insRate / 100)) / 12;
    const pmiMonthly = dpPct < 20 ? (loan * (pmiRate / 100)) / 12 : 0;
    const total = pi + taxMonthly + insMonthly + pmiMonthly;
    // Income-needed: housing-only at 28%, total-debt at 36% (assumes housing is sole debt).
    const income28 = (total * 12) / 0.28;
    const income36 = (total * 12) / 0.36;
    return {
      dpPct,
      downPayment,
      loan,
      pi,
      taxMonthly,
      insMonthly,
      pmiMonthly,
      total,
      income28,
      income36,
    };
  }

  // ---------- UI ----------

  function populateCounties() {
    const sel = $("county");
    window.COUNTY_TAX_RATES.forEach((c, i) => {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${c.name} (${c.rate.toFixed(2)}%)`;
      sel.appendChild(opt);
    });
  }

  function readForm() {
    const countyIdx = parseInt($("county").value, 10) || 0;
    const county = window.COUNTY_TAX_RATES[countyIdx];
    const taxOverride = parseFloat($("taxOverride").value);
    const taxRate = Number.isFinite(taxOverride) ? taxOverride : county.rate;

    const dps = Array.from(document.querySelectorAll(".dp"))
      .map((el) => parseFloat(el.value))
      .filter((v) => Number.isFinite(v));

    return {
      address: $("address").value.trim(),
      beds: parseFloat($("beds").value) || 0,
      baths: parseFloat($("baths").value) || 0,
      sqft: parseFloat($("sqft").value) || 0,
      year: parseInt($("year").value, 10) || 0,
      price: parseFloat($("price").value) || 0,
      countyName: county.name,
      taxRate,
      rate: parseFloat($("rate").value) || 0,
      term: parseInt($("term").value, 10) || 30,
      insRate: parseFloat($("insRate").value) || 0,
      pmiRate: parseFloat($("pmiRate").value) || 0,
      dps,
      agentName: $("agentName").value.trim(),
      agentContact: $("agentContact").value.trim(),
    };
  }

  function renderFlyer(input) {
    const flyer = $("flyer");
    flyer.hidden = false;

    $("f-address").textContent = input.address || "Property Address";
    const metaBits = [];
    if (input.beds) metaBits.push(`${input.beds} bd`);
    if (input.baths) metaBits.push(`${input.baths} ba`);
    if (input.sqft) metaBits.push(`${input.sqft.toLocaleString()} sq ft`);
    if (input.year) metaBits.push(`built ${input.year}`);
    if (input.countyName) metaBits.push(input.countyName);
    $("f-meta").textContent = metaBits.join("  ·  ");
    $("f-price").textContent = fmtUSD(input.price);

    const scenarios = input.dps.map((dpPct) =>
      computeScenario({
        price: input.price,
        dpPct,
        rate: input.rate,
        term: input.term,
        taxRate: input.taxRate,
        insRate: input.insRate,
        pmiRate: input.pmiRate,
      })
    );

    // Headers
    scenarios.forEach((s, i) => {
      const hdr = $(`hdr-${i + 1}`);
      if (hdr) hdr.innerHTML = `${s.dpPct}% Down<br><span style="font-weight:400;font-size:0.8rem">${fmtUSD(s.downPayment)}</span>`;
    });
    // Hide unused columns (if fewer than 4 scenarios)
    for (let i = scenarios.length + 1; i <= 4; i++) {
      const hdr = $(`hdr-${i}`);
      if (hdr) hdr.textContent = "—";
    }

    const body = $("scenario-body");
    body.innerHTML = "";

    const rows = [
      { kind: "section", label: "Loan" },
      { kind: "row", label: "Loan Amount", get: (s) => fmtUSD(s.loan) },
      { kind: "section", label: "Monthly Payment" },
      { kind: "row", label: "Principal & Interest", get: (s) => fmtUSDc(s.pi) },
      { kind: "row", label: "Property Tax (est.)", get: (s) => fmtUSDc(s.taxMonthly) },
      { kind: "row", label: "Homeowner's Insurance (est.)", get: (s) => fmtUSDc(s.insMonthly) },
      { kind: "row", label: "PMI (if <20% down)", get: (s) => (s.pmiMonthly > 0 ? fmtUSDc(s.pmiMonthly) : "—") },
      { kind: "total", label: "Total Monthly Payment", get: (s) => fmtUSDc(s.total) },
      { kind: "section", label: "Income Needed to Qualify (annual)" },
      { kind: "row", label: "28% housing ratio", get: (s) => fmtUSD(s.income28) },
      { kind: "row", label: "36% total-debt ratio", get: (s) => fmtUSD(s.income36) },
    ];

    rows.forEach((r) => {
      const tr = document.createElement("tr");
      if (r.kind === "section") {
        tr.classList.add("section-header");
        const td = document.createElement("td");
        td.colSpan = scenarios.length + 1;
        td.textContent = r.label;
        tr.appendChild(td);
      } else {
        if (r.kind === "total") tr.classList.add("total");
        const labelTd = document.createElement("td");
        labelTd.textContent = r.label;
        tr.appendChild(labelTd);
        scenarios.forEach((s) => {
          const td = document.createElement("td");
          td.textContent = r.get(s);
          tr.appendChild(td);
        });
        // Pad columns if fewer than 4 scenarios
        for (let i = scenarios.length; i < 4; i++) {
          const td = document.createElement("td");
          td.textContent = "";
          tr.appendChild(td);
        }
      }
      body.appendChild(tr);
    });

    $("f-assumptions").textContent =
      `Assumptions: ${input.rate.toFixed(2)}% interest, ${input.term}-yr term · ` +
      `Property tax ${input.taxRate.toFixed(2)}% / yr (${input.countyName}) · ` +
      `Insurance ${input.insRate.toFixed(2)}% / yr · PMI ${input.pmiRate.toFixed(2)}% / yr (when <20% down).`;

    const branding = [];
    if (input.agentName) branding.push(input.agentName);
    if (input.agentContact) branding.push(input.agentContact);
    $("f-branding").textContent = branding.join("  ·  ");

    flyer.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---------- Wire up ----------

  document.addEventListener("DOMContentLoaded", () => {
    populateCounties();
    $("flyer-form").addEventListener("submit", (e) => {
      e.preventDefault();
      renderFlyer(readForm());
    });
    $("printBtn").addEventListener("click", () => {
      if ($("flyer").hidden) renderFlyer(readForm());
      window.print();
    });
  });

  // Expose calc for testing in console.
  window.__mortgage = { principalAndInterest, computeScenario };
})();
