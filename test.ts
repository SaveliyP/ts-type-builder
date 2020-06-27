import { strict as assert } from 'assert';
import { array, bool, dict, intersection, literal, num, optional, str, strDict, union } from './index';

function test0() {
    assert(literal(8)(8), "test0_1");
    assert(literal("test")("test"), "test0_2");
    assert(!literal("test")("test2"), "test0_3");
}

function test1() {
    assert(num(5), "test1_1");
    assert(num(NaN), "test1_2");
    assert(num(Infinity), "test1_3");
    assert(!num("test"), "test1_4");
    assert(!num(true), "test1_5");
    assert(!num({1: 1, 2: 2}), "test1_6");
    assert(!num([1, 2, 3]), "test1_7");
}

function test2() {
    assert(str("ayy lmao"), "test2_1");
    assert(str(""), "test2_2");
    assert(!str(undefined), "test2_3");
    assert(!str({"1": "1", "2": "2"}), "test2_4");
    assert(!str(["1", "2", "3"]), "test2_5");
}

function test3() {
    assert(bool(false), "test3_1");
    assert(bool(true), "test3_2");
    assert(!bool(0), "test3_3");
    assert(!bool(NaN), "test3_4");
    assert(!bool(null), "test3_5");
    assert(!bool(undefined), "test3_6");
    assert(!bool(""), "test3_7");
}

function test4() {
    const lit1 = "literal1";
    const lit2 = 17;
    const lit3 = true;
    const type = union([lit1, lit2, lit3]);

    assert(type("literal1"), "test4_1");
    assert(type(17), "test4_2");
    assert(type(true), "test4_3");
    assert(!type(false), "test4_4");
    assert(!type(16), "test4_5");
    assert(!type(""), "test4_6");
    assert(!type([16]), "test4_7");
}

function test5() {
    const lit1 = "literal1";
    const lit2 = 17;
    const lit3 = true;
    const type = array(union([lit1, lit2, lit3]));

    assert(type(["literal1", 17, true]), "test5_1");
    assert(!type(["literal1", 16, true]), "test5_2");
    assert(!type(["literal1", 17, false]), "test5_3");
    assert(!type(["literal2", 17, false]), "test5_4");
    assert(!type(16), "test5_5");
    assert(!type({length: 3, 0: "literal1", 1: 17, 2: true}), "test5_6");
    assert(type([true, true, true, "literal1"]), "test5_7");
}

function test6() {
    const lit1 = "literal1";
    const lit2 = 17;
    const lit3 = true;
    const type = array(intersection([union([lit1, lit2, lit3]), num]));

    assert(!type(["literal1", 17, true]), "test6_1");
    assert(type([17, 17, 17]), "test6_2");
    assert(!type([16, 17, 18]), "test6_3");
    assert(!type(["literal2", 17, false]), "test6_4");
    assert(!type(16), "test6_5");
    assert(!type({length: 3, 0: "literal1", 1: 17, 2: true}), "test6_6");
    assert(!type([true, true, true, "literal1"]), "test6_7");
}

function test7() {
    const lit1 = "literal1";
    const lit2 = 17;
    const lit3 = true;
    const type = dict({
        version: 1,
        test_value: intersection([union([lit1, lit2, lit3]), num]),
        name: str,
        surname: str,
        age: num,
        addresses: array(dict({
            line1: str,
            line2: optional(str),
            city: str,
            state: optional(str),
            country: str
        }))
    });

    assert(!type(["literal1", 17, true]), "test7_1");
    assert(type({
        version: 1,
        test_value: 17,
        name: "Ayy",
        surname: "Lmao",
        age: 12,
        addresses: [
            {
                line1: "Main street 17",
                city: "Magic",
                country: "XX"
            }
        ]
    }), "test7_2");
    assert(!type({
        version: 2,
        test_value: 17,
        name: "Ayy",
        surname: "Lmao",
        age: 12,
        addresses: [
            {
                line1: "Main street 17",
                city: "Magic",
                country: "XX"
            }
        ]
    }), "test7_3");
    assert(!type({
        version: 1,
        test_value: 16,
        name: "Ayy",
        surname: "Lmao",
        age: 12,
        addresses: [
            {
                line1: "Main street 17",
                city: "Magic",
                country: "XX"
            }
        ]
    }), "test7_4");
    assert(!type(16), "test7_5");
    assert(!type({length: 3, 0: "literal1", 1: 17, 2: true}), "test7_6");
    assert(!type([true, true, true, "literal1"]), "test7_7");
}

test0();
test1();
test2();
test3();
test4();
test5();
test6();
test7();