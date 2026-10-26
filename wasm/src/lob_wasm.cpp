// Browser benchmark for the three order books from github.com/alienxviking/limit-order-book.
// The book headers in this folder are copied unchanged from that repo.
//
// Browsers coarsen their clocks, so instead of timing single operations (as the
// native bench does) this times whole phases and divides:
//   phase 1: add n orders (sequential ids, random side, price and qty in the band)
//   phase 2: cancel every one of them, in a random order
// The book is therefore up to n orders deep when the cancels run.

#include <emscripten/emscripten.h>

#include <algorithm>
#include <cstdint>
#include <memory>
#include <random>
#include <vector>

#include "array_book.hpp"
#include "heap_book.hpp"
#include "map_book.hpp"

namespace {

struct Order { uint64_t id; Side side; double price; long qty; };

volatile uint64_t g_sink;
double g_cancel_ns = 0;
int g_cancel_ok = 0;

std::vector<Order> make_adds(int n, uint32_t seed) {
    std::mt19937 rng(seed);
    std::uniform_int_distribution<int> coin(0, 1);
    std::uniform_int_distribution<long> qty(1, 100);
    std::uniform_int_distribution<int> bid(MIN_BID_TICK, MAX_BID_TICK);
    std::uniform_int_distribution<int> ask(MIN_ASK_TICK, MAX_ASK_TICK);
    std::vector<Order> v(n);
    for (int i = 0; i < n; i++) {
        Side s = coin(rng) ? Side::Buy : Side::Sell;
        v[i] = {uint64_t(i + 1), s, to_price(s == Side::Buy ? bid(rng) : ask(rng)), qty(rng)};
    }
    return v;
}

template <class Book>
double run_phases(const std::vector<Order>& adds, const std::vector<uint64_t>& cancels) {
    auto book = std::make_unique<Book>();
    double t0 = emscripten_get_now();
    for (const Order& o : adds) book->add_order(o.id, o.side, o.price, o.qty);
    double t1 = emscripten_get_now();
    int ok = 0;
    for (uint64_t id : cancels) ok += book->cancel_order(id);
    double t2 = emscripten_get_now();
    g_sink = g_sink + ok + book->get_bbo().bid_qty;
    g_cancel_ok = ok;
    g_cancel_ns = (t2 - t1) * 1e6 / double(cancels.size());
    return (t1 - t0) * 1e6 / double(adds.size());
}

}  // namespace

extern "C" {

// impl: 0 = std::map book, 1 = heap book, 2 = flat array book (ours).
// Returns ns per add; lob_last_cancel_ns() / lob_last_cancel_ok() describe the cancel phase.
EMSCRIPTEN_KEEPALIVE double lob_run(int impl, int n, unsigned seed) {
    std::vector<Order> adds = make_adds(n, seed);
    std::vector<uint64_t> cancels(n);
    for (int i = 0; i < n; i++) cancels[i] = adds[i].id;
    std::shuffle(cancels.begin(), cancels.end(), std::mt19937(seed ^ 0x9e3779b9u));
    switch (impl) {
        case 0: return run_phases<MapBook>(adds, cancels);
        case 1: return run_phases<HeapBook>(adds, cancels);
        default: return run_phases<ArrayBook>(adds, cancels);
    }
}

EMSCRIPTEN_KEEPALIVE double lob_last_cancel_ns() { return g_cancel_ns; }
EMSCRIPTEN_KEEPALIVE int lob_last_cancel_ok() { return g_cancel_ok; }

}
