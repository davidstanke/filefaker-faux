export type RecordType = 'business' | 'individual';

export type RecordStatus = 'active' | 'lead' | 'inactive' | 'archived';

export type AddressType = 'billing' | 'shipping' | 'primary' | 'other';

export interface Address {
	id: string;
	street: string;
	suite?: string;
	city: string;
	state: string;
	zip: string;
	country: string;
	type: AddressType;
}

export interface ContactPerson {
	id: string;
	firstName: string;
	lastName: string;
	title: string;
	email: string;
	phone: string;
	isPrimary: boolean;
}

export interface Note {
	id: string;
	author: string;
	timestamp: string; // ISO 8601 string
	content: string;
}

export interface RecordItem {
	id: string;
	recordType: RecordType;
	accountNumber: string;
	status: RecordStatus;
	category: string;
	name: string;
	department?: string;
	title?: string;
	email: string;
	phone: string;
	fax?: string;
	website?: string;
	description: string;
	addresses: Address[];
	contacts: ContactPerson[];
	notes: Note[];
	createdAt: string;
	updatedAt: string;
	lastAccessedAt: string;
}

export interface RecordFilters {
	query?: string;
	recordType?: RecordType | 'all';
	status?: RecordStatus | 'all';
	state?: string;
	sortBy?: 'lastAccessedAt' | 'name' | 'accountNumber' | 'createdAt' | 'status';
	sortOrder?: 'asc' | 'desc';
}
