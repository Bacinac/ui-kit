// The words the kit itself says, in Croatian, which is where a word is
// written first. A module says only what it alone knows; saying one of these
// again throws at boot.

export const hr = {
	'common.close': 'Zatvori',
	'common.confirm': 'Potvrdi',
	'common.requestFailed': 'Greška: {detail}',
	'common.save': 'Spremi',
	'common.saving': 'Spremam…',
	'common.unreachable': 'Poslužitelj ne odgovara.',
	'letters.label': 'Slova',
	'runtime.hours': '{h} h',
	'runtime.minutes': '{m} min',
	'settings.bool.off': 'Isključeno',
	'settings.bool.on': 'Uključeno',
	'settings.err.bad_value': 'nedozvoljena vrijednost',
	'settings.err.not_a_number': 'vrijednost nije broj',
	'settings.err.not_editable': 'postavka se ne može mijenjati',
	'settings.err.unknown_key': 'nepoznata postavka',
	'settings.saveFailed': 'Postavke nisu spremljene — {field}: {reason}',
	'settings.saved': 'Postavke su spremljene.',
	'settings.secretSet': '•••••••• (postavljeno — ostavite prazno za nepromijenjeno)',
	'settings.secretUnset': 'nije postavljeno',
	'settings.unsaved': 'Nespremljene promjene',
} as const;
