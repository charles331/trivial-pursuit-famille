import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeStoredProfile, StoredProfile } from '../src/utils/profileStorage';

const savedProfile: StoredProfile = {
  name: 'Sophie',
  avatarId: 'lion',
  color: '#EF4444',
  difficulty: 'adulte',
};

test('une modification faite dans le salon complète le profil mémorisé', () => {
  assert.deepEqual(mergeStoredProfile(savedProfile, { avatarId: 'owl' }), {
    name: 'Sophie',
    avatarId: 'owl',
    color: '#EF4444',
    difficulty: 'adulte',
  });
});

test('le prénom, la couleur et le niveau peuvent aussi être mémorisés', () => {
  assert.deepEqual(mergeStoredProfile(savedProfile, {
    name: 'Maman',
    color: '#3B82F6',
    difficulty: 'ado',
  }), {
    name: 'Maman',
    avatarId: 'lion',
    color: '#3B82F6',
    difficulty: 'ado',
  });
});
