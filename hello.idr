module Main

import IQuery
import IQuery.Elements
import IQuery.Event
import Data.Fin
import Data.Vect

%default total

strToVec : (s : String) -> (n : Nat ** Vect n Char)
strToVec s = (length (unpack s) ** fromList (unpack s))

data Place : Nat -> Type where
  MkPlace : (a : Nat) -> (b : Nat) -> Place (a + b)

place : Place n -> Nat
place (MkPlace a b) = a

remaining : Place n -> Nat
remaining (MkPlace a b) = b

data Interval : Nat -> Type where
  MkInterval : (a : Nat) -> (b : Nat) -> (c : Nat) -> Interval (a + b + c)

start : Interval n -> Nat
start (MkInterval a b c) = a

range : Interval n -> Nat
range (MkInterval a b c) = b

remainder : Interval n -> Nat
remainder (MkInterval a b c) = c

startPlace : Interval n -> Place n
startPlace (MkInterval a b c) = replace (plusAssociative a b c) $ MkPlace a (b + c)

endPlace : Interval n -> Place n
endPlace (MkInterval a b c) = MkPlace (a + b) c

subVect : Vect n a -> (r : Interval n) -> Vect (range r) a
subVect v (MkInterval a b c) = drop a (take (a + b) v)

PlusMinus : (a : Nat) -> (b : Nat) -> {smaller:LTE a b} -> a + (b - a) = b
PlusMinus Z     b     {smaller} = replace (minusZeroRight b) Refl
PlusMinus (S a) Z     {smaller} = absurd smaller
PlusMinus (S a) (S b) {smaller} = cong {f=S} inductive_hypothesis where
    inductive_hypothesis = PlusMinus a b {smaller=fromLteSucc smaller}

MinusPlus : (a : Nat) -> (b : Nat) -> {smaller:LTE b a} -> (a - b) + b = a
MinusPlus a b {smaller} = rewrite plusCommutative (a - b) b in PlusMinus b a {smaller}

bounds : Interval n -> Interval n -> Interval n
bounds {n} r0 r1 = MkInterval a b c
  where
    a : Nat
    a = min (start r0 r1)
    c : Nat
    c = min (remainder r0 r1)
    b : Nat
    b = n - c - a
  
using (n : Nat, str : Vect n Char)
  data Expr : Interval n -> Type where
    Invalid : r -> Expr r
    Num : r -> Nat -> Expr r
    Plus : Expr r0 -> Expr r1 -> Expr (bounds r0 r1)
    Mult : Expr r0 -> Expr r1 -> Expr (bounds r0 r1)

{-
data Colour : Type where
  Black : Colour
  Red : Colour
  Blue : Colour

data Colouring (a : String) : Type where
  MkColouring : Vect (length a) Colour -> Colouring a

data Parser (a : Type) : Type where
  MkParser : (String -> Maybe (a, String, String) -> Parser a

(>>=) : Parser a -> (a -> Parser b) -> Parser b
MkParser m >>= f =

parse : (a : String) -> Colouring a
-}

change_cb : Event -> JS_IO Int
change_cb _ = do
  alert "changed"
  return 0

partial
main : JS_IO ()
main = do
  nodes <- query "p"
  Just p <- elemAt nodes 0
  setProperty p "contentEditable" "true"
  onEvent KeyUp p change_cb
  onEvent Blur p change_cb
  --setText p "Hello?"
