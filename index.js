const N8N_WEBHOOK_URL = "https://primary-production-5e0de.up.railway.app/webhook/c4b4c5c0-f0f2-4fd1-8d93-1105e860a258";

document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".step");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const progressFill = document.getElementById("progress");
  const stepIndicator = document.getElementById("step-indicator");
  const form = document.getElementById("multiStepForm");
  const errorMsgs = document.querySelectorAll(".error-msg");

  let currentStep = 0;
  let isSubmitting = false;

  function hideErrors() {
    errorMsgs.forEach((msg) => {
      msg.style.display = "none";
    });
  }

  function showError(stepIndex) {
    hideErrors();
    const error = document.getElementById(`error-step-${stepIndex}`);
    if (error) {
      error.style.display = "block";
    }
  }

  function updateForm() {
    steps.forEach((step, index) => {
      step.classList.toggle("active", index === currentStep);
    });

    prevBtn.style.display = currentStep === 0 ? "none" : "block";
    nextBtn.textContent = currentStep === steps.length - 1 ? "Siųsti" : "Toliau";
    nextBtn.disabled = isSubmitting;

    const progressPercent = ((currentStep + 1) / steps.length) * 100;
    progressFill.style.width = `${progressPercent}%`;
    stepIndicator.textContent = `${currentStep + 1} ŽINGSNIS IŠ ${steps.length}`;

    hideErrors();
  }

  function validateStep() {
    const activeStep = steps[currentStep];
    const inputs = activeStep.querySelectorAll('input[type="radio"]');

    if (inputs.length === 0) return true;

    return Array.from(inputs).some((input) => input.checked);
  }

  function getFormPayload() {
    const service = form.querySelector('input[name="service"]:checked')?.value;
    const budget = form.querySelector('input[name="budget"]:checked')?.value;
    const timeline = form.querySelector('input[name="timeline"]:checked')?.value;

    if (!service || !budget || !timeline) {
      throw new Error("Ne visi laukai pasirinkti");
    }

    return {
      paslauga: service,
      biudzetas: budget,
      terminas: timeline,
      komentaras: "",
    };
  }

  async function submitForm() {
    const data = getFormPayload();

    console.log("Siunčiami duomenys:", data);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Webhook klaida: ${response.status}`);
    }
  }

  nextBtn.addEventListener("click", async () => {
    if (isSubmitting) return;

    if (!validateStep()) {
      showError(currentStep);
      return;
    }

    if (currentStep < steps.length - 1) {
      currentStep++;
      updateForm();
      return;
    }

    isSubmitting = true;
    nextBtn.textContent = "Siunčiama...";
    nextBtn.disabled = true;

    try {
      await submitForm();
      alert("Forma sėkmingai išsiųsta!");

      form.reset();
      currentStep = 0;
    } catch (error) {
      console.error("Nepavyko išsiųsti formos:", error);
      alert("Nepavyko išsiųsti formos. Bandykite dar kartą.");
    } finally {
      isSubmitting = false;
      updateForm();
    }
  });

  prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      updateForm();
    }
  });

  form.addEventListener("change", () => {
    if (validateStep()) {
      hideErrors();
    }
  });

  updateForm();
});
