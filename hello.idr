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
  
{-
data Expr (a : String) : Type where
  Invalid : Expr
  Num : Nat -> Expr
  Plus : Expr -> Expr -> Expr
  Mult : Expr -> Expr -> Expr

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
