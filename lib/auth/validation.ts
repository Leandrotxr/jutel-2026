export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string) {
  const phone = onlyDigits(value);
  return phone.length === 10 || phone.length === 11;
}

export function isValidCpf(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digit = (base: string, factor: number) => {
    let sum = 0;
    for (const char of base) {
      sum += Number(char) * factor;
      factor -= 1;
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return digit(cpf.slice(0, 9), 10) === Number(cpf[9]) && digit(cpf.slice(0, 10), 11) === Number(cpf[10]);
}

export function formatCpfInput(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatPhoneInput(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCpfDisplay(value: string) {
  return formatCpfInput(value);
}

export function formatPhoneDisplay(value: string) {
  return formatPhoneInput(value);
}

export function mapAuthError(message: string) {
  if (/invalid login/i.test(message)) return "Email ou senha inválidos.";
  if (/already registered/i.test(message)) return "Este email já está cadastrado.";
  if (/password/i.test(message)) return "A senha deve ter pelo menos 6 caracteres.";
  if (/rate limit/i.test(message)) return "Muitas tentativas. Espere um momento e tente de novo.";
  if (/row-level security|permission denied|42501/i.test(message)) {
    return "Sem permissão para essa ação.";
  }
  if (/pelo menos um diretor/i.test(message)) return "É preciso manter pelo menos um diretor.";
  return message;
}
