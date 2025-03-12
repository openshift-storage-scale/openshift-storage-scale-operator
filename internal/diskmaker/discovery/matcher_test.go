//nolint:dupl
package discovery

import (
	"testing"

	internal "github.com/validatedpatterns/openshift-storage-scale-operator/internal/diskutils"

	"github.com/stretchr/testify/assert"
)

const (
	Ki = 1024
	Mi = Ki * 1024
	Gi = Mi * 1024
)

// test filters

func TestNotReadOnly(t *testing.T) {
	matcherMap := filterMap
	matcher := notReadOnly
	results := []knownMatcherResult{
		// true, no error
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{ReadOnly: false},
			expectMatch: true, expectErr: false,
		},
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{ReadOnly: false},
			expectMatch: true, expectErr: false,
		},
		// false, no error
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{ReadOnly: true},
			expectMatch: false, expectErr: false,
		},
	}
	assertAll(t, results)
}

func TestNotRemovable(t *testing.T) {
	matcherMap := filterMap
	matcher := notRemovable
	results := []knownMatcherResult{
		// true, no error
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{Removable: false},
			expectMatch: true, expectErr: false,
		},
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{Removable: true},
			expectMatch: false, expectErr: false,
		},
	}
	assertAll(t, results)
}

func TestNotSuspended(t *testing.T) {
	matcherMap := filterMap
	matcher := notSuspended
	results := []knownMatcherResult{
		// true
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{State: "running"},
			expectMatch: true,
		},
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{State: "live"},
			expectMatch: true,
		},
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{State: ""},
			expectMatch: true,
		},
		// false
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{State: "suspended"},
			expectMatch: false,
		},
	}
	assertAll(t, results)
}
func TestNoBiosBootInPartLabel(t *testing.T) {
	matcherMap := filterMap
	matcher := noBiosBootInPartLabel
	results := []knownMatcherResult{
		// true
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{PartLabel: "asdf"},
			expectMatch: true,
		},
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{PartLabel: ""},
			expectMatch: true,
		},
		// false
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{PartLabel: "BIOS-BOOT"},
			expectMatch: false,
		},
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{PartLabel: "bios-boot"},
			expectMatch: false,
		},
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{PartLabel: "bios boot partition"},
			expectMatch: false,
		},
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{PartLabel: "this is a BIOS BOOT partition"},
			expectMatch: false,
		},
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{PartLabel: "bios"},
			expectMatch: false,
		},
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{PartLabel: "BIOS"},
			expectMatch: false,
		},
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{PartLabel: "boot"},
			expectMatch: false,
		},
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{PartLabel: "BOOT"},
			expectMatch: false,
		},
	}
	assertAll(t, results)
}

func TestNoFilesystemSignature(t *testing.T) {
	matcherMap := filterMap
	matcher := noFilesystemSignature
	results := []knownMatcherResult{
		// true
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{FSType: ""},
			expectMatch: true,
		},
		// false
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{FSType: "ext4"},
			expectMatch: false,
		},
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{FSType: "crypto_LUKS"},
			expectMatch: false,
		},
		{
			matcherMap: matcherMap, matcher: matcher,
			dev:         internal.BlockDevice{FSType: "swap"},
			expectMatch: false,
		},
	}
	assertAll(t, results)
}

// a known result for a particular filter that can be asserted
type knownMatcherResult struct {
	// should pass one of filterMap or matcherMap
	matcherMap  map[string]func(internal.BlockDevice) (bool, error)
	matcher     string
	dev         internal.BlockDevice
	expectMatch bool
	expectErr   bool
}

func assertAll(t *testing.T, results []knownMatcherResult) {
	for _, result := range results {
		result.assert(t)
	}
}

func (r *knownMatcherResult) assert(t *testing.T) {
	t.Logf("matcher name: %s, dev: %+v", r.matcher, r.dev)
	matcher, ok := r.matcherMap[r.matcher]
	assert.True(t, ok, "expected to find matcher in map", r.matcher)
	match, err := matcher(r.dev)
	if r.expectErr {
		assert.Error(t, err)
	} else {
		assert.NoError(t, err)
	}
	if r.expectMatch {
		assert.True(t, match)
	} else {
		assert.False(t, match)
	}
}
